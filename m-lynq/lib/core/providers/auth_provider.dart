import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../member_emails.dart';

class MemberAuthState {
  final User? user;
  final Map<String, dynamic>? profile;
  final bool isLoading;
  final String? error;

  const MemberAuthState({
    this.user,
    this.profile,
    this.isLoading = true,
    this.error,
  });

  bool get isAuthenticated => user != null && profile != null;
  bool get isIsteMember => profile?['is_iste_member'] ?? (profile?['membership_id'] != null && profile!['membership_id'].toString().isNotEmpty);
  bool get isRegistered => profile?['is_registered'] ?? true;
  String get name => profile?['name'] as String? ?? '';
  String get role => profile?['role'] as String? ?? 'member';
  String get membershipId => profile?['membership_id'] as String? ?? profile?['iste_membership_id'] as String? ?? '';
  DateTime? get validityEnd => profile?['validity_end'] != null ? DateTime.tryParse(profile!['validity_end'].toString()) : null;
  bool get isMembershipValid => membershipId.isNotEmpty;
  int? get daysUntilExpiry => validityEnd != null ? DateTime.now().difference(validityEnd!).inDays.abs() : null;

  MemberAuthState copyWith({
    User? user,
    Map<String, dynamic>? profile,
    bool? isLoading,
    String? error,
  }) {
    return MemberAuthState(
      user: user ?? this.user,
      profile: profile ?? this.profile,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
    );
  }
}

class AuthNotifier extends StateNotifier<MemberAuthState> {
  AuthNotifier() : super(const MemberAuthState()) {
    _init();
  }

  final _supabase = Supabase.instance.client;
  StreamSubscription<AuthState>? _authSubscription;
  Map<String, dynamic>? _pendingSignUpData;

  void _init() {
    _authSubscription = _supabase.auth.onAuthStateChange.listen((data) async {
      final user = data.session?.user;
      if (user != null) {
        await _loadProfile(user);
      } else {
        state = const MemberAuthState(isLoading: false);
      }
    });

    final currentUser = _supabase.auth.currentUser;
    if (currentUser != null) {
      _loadProfile(currentUser);
    } else {
      state = const MemberAuthState(isLoading: false);
    }
  }

  @override
  void dispose() {
    _authSubscription?.cancel();
    super.dispose();
  }

  Future<void> setPendingSignUpData(Map<String, dynamic> data) async {
    _pendingSignUpData = data;
    try {
      final prefs = await SharedPreferences.getInstance();
      if (data['name'] != null) prefs.setString('pending_name', data['name']);
      if (data['phone'] != null) prefs.setString('pending_phone', data['phone']);
      if (data['roll_number'] != null) prefs.setString('pending_roll', data['roll_number']);
      if (data['college'] != null) prefs.setString('pending_college', data['college']);
    } catch (_) {}
  }

  Future<Map<String, dynamic>?> _restorePendingSignUpData() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final name = prefs.getString('pending_name');
      final phone = prefs.getString('pending_phone');
      final roll = prefs.getString('pending_roll');
      final college = prefs.getString('pending_college');
      if (name != null || phone != null) {
        return {
          'name': name ?? '',
          'phone': phone ?? '',
          'roll_number': roll ?? '',
          'college': college ?? '',
        };
      }
    } catch (_) {}
    return null;
  }

  Future<void> _clearPendingSignUpData() async {
    _pendingSignUpData = null;
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('pending_name');
      await prefs.remove('pending_phone');
      await prefs.remove('pending_roll');
      await prefs.remove('pending_college');
    } catch (_) {}
  }

  Future<void> _loadProfile(User user) async {
    state = MemberAuthState(user: user, isLoading: true);
    try {
      final userEmail = (user.email ?? '').trim().toLowerCase();

      final profileData = await _supabase
          .from('profiles')
          .select()
          .eq('id', user.id)
          .maybeSingle();

      final p = Map<String, dynamic>.from(profileData ?? {
        'id': user.id,
        'email': userEmail,
        'name': userEmail.split('@').first,
        'role': 'member',
        'is_iste_member': true,
      });

      if (p['iste_membership_id'] != null) {
        p['membership_id'] = p['iste_membership_id'];
      }
      p['validity_end'] ??= p['expiry_date'];

      await _clearPendingSignUpData();

      state = MemberAuthState(user: user, profile: p, isLoading: false);
    } catch (e) {
      debugPrint('Error loading member profile: $e');
      state = MemberAuthState(
        user: user,
        profile: {
          'id': user.id,
          'email': user.email ?? '',
          'name': (user.email ?? '').split('@').first,
          'role': 'member',
        },
        isLoading: false,
      );
    }
  }

  Future<Map<String, dynamic>?> checkEmailMembership(String email) async {
    final cleanEmail = email.trim().toLowerCase();

    if (isIsteMemberEmail(cleanEmail)) {
      return {
        'status': 'member_otp_login',
        'is_iste_member': true,
      };
    }

    final profileRes = await _supabase
        .from('profiles')
        .select('id, iste_membership_id, name, phone, email, is_iste_member')
        .ilike('email', cleanEmail)
        .maybeSingle();

    if (profileRes != null) {
      return {
        'status': 'member_otp_login',
        'is_iste_member': profileRes['is_iste_member'] ?? true,
        'iste_id': profileRes['iste_membership_id'],
        'name': profileRes['name'] ?? '',
        'phone': profileRes['phone'] ?? '',
      };
    }

    return null;
  }

  Future<void> requestOTP(String email, {bool isSignUp = false}) async {
    await _supabase.auth.signInWithOtp(
      email: email.trim(),
      shouldCreateUser: isSignUp,
      emailRedirectTo: 'com.iste.memberapp://login-callback',
    );
  }

  Future<void> verifyOTP(String email, String otp) async {
    final cleanEmail = email.trim().toLowerCase();
    final res = await _supabase.auth.verifyOTP(
      email: cleanEmail,
      token: otp,
      type: OtpType.email,
    );

    if (res.user != null) {
      try {
        await _supabase.from('profiles').upsert({
          'id': res.user!.id,
          'email': cleanEmail,
          'status': 'active',
        }, onConflict: 'id');

        await _loadProfile(res.user!);
      } catch (e) {
        debugPrint('Profile sync error: $e');
        await _loadProfile(res.user!);
      } finally {
        await _clearPendingSignUpData();
      }
    } else {
      throw Exception('OTP verification failed. Please try again.');
    }
  }

  Future<void> signOut() async {
    await _supabase.auth.signOut();
    state = const MemberAuthState(isLoading: false);
  }

  Future<void> refresh() async {
    final user = _supabase.auth.currentUser;
    if (user != null) await _loadProfile(user);
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, MemberAuthState>(
  (ref) => AuthNotifier(),
);
