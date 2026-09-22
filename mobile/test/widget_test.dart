import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:monyun_mobile/main.dart';

void main() {
  testWidgets('BaitiMobileApp smoke test', (WidgetTester tester) async {
    SharedPreferences.setMockInitialValues({});
    await tester.pumpWidget(const BaitiMobileApp());
    await tester.pumpAndSettle();
    expect(find.text('BAITI ATELIER'), findsOneWidget);
  });
}

