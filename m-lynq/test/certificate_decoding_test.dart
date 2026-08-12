import 'dart:convert';
import 'dart:io';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('GZIP and UTF-8 decoding for Certificate HTML Templates', () {
    const rawHtml = '<html><body><h1>Certificate for {{student_name}}</h1></body></html>';
    final utf8Bytes = utf8.encode(rawHtml);
    final gzippedBytes = gzip.encode(utf8Bytes);

    // Verify magic bytes (0x1f, 0x8b)
    expect(gzippedBytes[0], equals(0x1f));
    expect(gzippedBytes[1], equals(0x8b));

    // Decode GZIP stream if header detected
    List<int> uncompressed = gzippedBytes;
    if (gzippedBytes.length >= 2 && gzippedBytes[0] == 0x1f && gzippedBytes[1] == 0x8b) {
      uncompressed = gzip.decode(gzippedBytes);
    }

    final decodedHtml = utf8.decode(uncompressed, allowMalformed: true);
    expect(decodedHtml, equals(rawHtml));
    expect(decodedHtml.contains('{{student_name}}'), isTrue);
  });
}
