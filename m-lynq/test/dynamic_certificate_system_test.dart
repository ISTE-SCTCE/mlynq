import 'package:flutter_test/flutter_test.dart';
import 'package:m_lynq/shared/utils/dynamic_template_parser.dart';

void main() {
  group('DynamicTemplateParser Tests', () {
    test('Extracts explicit {{...}} tags correctly', () {
      const templateText = '''
        CERTIFICATE OF PARTICIPATION
        Presented to {{STUDENT_NAME}}
        for participating in {{EVENT_NAME}}
        held on {{EVENT_DATE}}
        Certificate ID: {{CERTIFICATE_ID}}
        Organized by {{ORGANIZER_NAME}} at {{VENUE}}
      ''';

      final tags = DynamicTemplateParser.parseTags(templateText);
      final tagStrings = tags.map((t) => t.tag).toList();

      expect(tagStrings, contains('{{STUDENT_NAME}}'));
      expect(tagStrings, contains('{{EVENT_NAME}}'));
      expect(tagStrings, contains('{{EVENT_DATE}}'));
      expect(tagStrings, contains('{{CERTIFICATE_ID}}'));
      expect(tagStrings, contains('{{ORGANIZER_NAME}}'));
      expect(tagStrings, contains('{{VENUE}}'));
    });

    test('Resolves dynamic values correctly', () {
      final values = DynamicTemplateParser.resolveValues(
        event: {
          'title': 'Flutter AI Workshop',
          'date': '2026-08-20',
          'location': 'Main Auditorium',
          'coordinator_name': 'Dr. Alan Turing',
        },
        studentName: 'Sarvesh R',
        certificateId: 'ISTE-101-0001',
      );

      expect(values['student_name'], equals('Sarvesh R'));
      expect(values['event_name'], equals('Flutter AI Workshop'));
      expect(values['event_date'], equals('2026-08-20'));
      expect(values['certificate_id'], equals('ISTE-101-0001'));
      expect(values['venue'], equals('Main Auditorium'));
      expect(values['organizer_name'], equals('Dr. Alan Turing'));
    });
  });
}
