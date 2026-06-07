# Hướng Dẫn Thuyết Trình: AI-Powered Test Runner

Tài liệu này dùng để chuẩn bị phần thuyết trình môn Testing cho script:

```text
scratch/ai_test_runner.js
```

Script này minh họa một quy trình kiểm thử có hỗ trợ AI: đọc mã nguồn, xác định hàm cần test, sinh file test, chạy test và báo cáo kết quả. Trong dự án hiện tại, script được viết để demo cho file:

```text
frontend/src/utils/helpers.js
```

Khi chạy, script sẽ sinh hoặc ghi lại file:

```text
frontend/src/utils/helpers.test.js
```

Lưu ý quan trọng: `ai_test_runner.js` là một script mô phỏng AI Test Assistant. Nó không gọi API AI thật và cũng không thật sự phân tích AST bằng thư viện parser. Tuy nhiên, luồng xử lý của nó mô phỏng đúng cách một công cụ AI testing hiện đại có thể hoạt động trong thực tế.

---

## 1. Mục Đích Của Script

Mục đích chính của script là trình diễn quy trình kiểm thử tự động theo 4 bước:

1. Đọc file mã nguồn cần kiểm thử.
2. Xác định các hàm quan trọng và chiến lược test.
3. Tự động sinh file test case.
4. Chạy test và so sánh kết quả thực tế với kết quả mong đợi.

Đây là ví dụ phù hợp cho môn Testing vì nó thể hiện rõ các khái niệm:

- Unit testing
- Test case
- Expected result và actual result
- Assertion
- Boundary value analysis
- Edge case
- Test runner
- Regression testing
- Test report

---

## 2. Cách Chạy Script

Tại thư mục gốc của dự án:

```powershell
cd C:\Users\AD\DALTA_app
node scratch/ai_test_runner.js
```

Sau khi chạy, terminal sẽ hiển thị quy trình 4 bước:

```text
=== [AI TEST ASSISTANT] DEPLOYING AGENT ON CODEBASE ===

[1/4] Reading target file: src/utils/helpers.js...
[2/4] Identifying boundary conditions & test strategies...
[3/4] Auto-generating test cases file...
[4/4] Executing test runner in real-time...
```

Kết quả cuối cùng có dạng:

```text
Test Results:
  Tests Passed: 2
  Tests Failed: 4
  Total time: 0.12s
```

Nếu tất cả test đúng, script sẽ in:

```text
=== ALL TESTS PASSED SUCCESSFULLY! DEPLOYMENT SHIELD ENFORCED ===
```

---

## 3. File `ai_test_runner.js` Làm Gì?

File `scratch/ai_test_runner.js` có thể chia thành các phần sau.

### 3.1. Import thư viện

Script dùng:

```js
const fs = require('fs');
const path = require('path');
```

Ý nghĩa:

- `fs`: làm việc với file, ví dụ kiểm tra file có tồn tại không và ghi file test mới.
- `path`: xử lý đường dẫn file để script chạy được ở nhiều vị trí khác nhau.

Đây là kỹ thuật giúp test runner tìm đúng file cần test trong project.

### 3.2. Tạo màu cho terminal

Script có object `colors` để in chữ màu xanh, đỏ, vàng, xám:

```js
const colors = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m"
};
```

Ý nghĩa trong thuyết trình:

- Màu xanh biểu thị test pass.
- Màu đỏ biểu thị test fail.
- Màu vàng biểu thị cảnh báo hoặc lý do lỗi.

Phần này không ảnh hưởng đến logic test, chỉ giúp báo cáo dễ nhìn hơn.

### 3.3. Hàm `sleep(ms)`

Script dùng:

```js
async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

Ý nghĩa:

- Tạm dừng chương trình trong vài mili giây.
- Tạo cảm giác AI đang phân tích từng bước.
- Làm demo dễ quan sát hơn trên terminal.

Trong thực tế, các công cụ AI testing có thể mất thời gian để đọc mã nguồn, phân tích logic và sinh test case. Ở đây, `sleep()` giúp mô phỏng quá trình đó.

---

## 4. Giải Thích Quy Trình 4 Bước

### Bước 1: Đọc file mã nguồn

Terminal hiển thị:

```text
[1/4] Reading target file: src/utils/helpers.js...
```

Script tìm file `helpers.js` bằng nhiều đường dẫn khác nhau:

```js
const possiblePaths = [
  path.resolve(__dirname, '../frontend/src/utils/helpers.js'),
  path.resolve(__dirname, '../../../frontend/src/utils/helpers.js'),
  path.resolve(process.cwd(), 'frontend/src/utils/helpers.js'),
  path.resolve(process.cwd(), 'src/utils/helpers.js')
];
```

Ý nghĩa chuyên môn:

- Đây là bước chuẩn bị môi trường test.
- Test runner cần biết chính xác file nào là đối tượng kiểm thử.
- Trong Testing, file được kiểm thử gọi là system under test hoặc unit under test.

Trong demo này, system under test là:

```text
frontend/src/utils/helpers.js
```

File này chứa các hàm xử lý dữ liệu sản phẩm như:

- `formatCarPrice(product)`
- `getPrimaryImage(product)`
- `formatMoney(value)`
- `mapProductToCar(product)`

### Bước 2: Xác định chiến lược kiểm thử

Terminal hiển thị:

```text
[2/4] Identifying boundary conditions & test strategies...
```

Script in ra các test case cần kiểm tra cho hai hàm chính:

```text
formatMoney(value)
mapProductToCar(product)
```

#### Hàm `formatMoney(value)`

Hàm này nhận một giá trị tiền và trả về chuỗi hiển thị giá tiền.

Các trường hợp test:

- Giá trị bình thường: kiểm tra định dạng số tiền.
- Giá trị lớn hơn hoặc bằng 1 tỷ: kiểm tra hậu tố `B VND`.
- Giá trị không hợp lệ như `NaN`, `Infinity`: kiểm tra fallback.

Khái niệm liên quan:

- Boundary value analysis: kiểm tra ở các ngưỡng quan trọng, ví dụ từ triệu lên tỷ.
- Edge case: kiểm tra trường hợp dễ gây lỗi như `NaN`, `Infinity`, dữ liệu rỗng.
- Input validation: kiểm tra cách hàm xử lý dữ liệu đầu vào không hợp lệ.

#### Hàm `mapProductToCar(product)`

Hàm này nhận object sản phẩm từ database hoặc API, sau đó chuyển thành object phù hợp để hiển thị ở frontend.

Các trường hợp test:

- Sản phẩm đặc biệt như `Apex R-7`.
- Sản phẩm thông thường.
- Dữ liệu thiếu field như `brand`, `sku`, `specifications`.
- Giá trị fallback mặc định.

Khái niệm liên quan:

- Data mapping test: kiểm tra việc chuyển đổi dữ liệu từ dạng này sang dạng khác.
- Default value test: kiểm tra giá trị mặc định khi dữ liệu thiếu.
- Regression test: đảm bảo logic mapping không bị hỏng khi code thay đổi.

### Bước 3: Tự động sinh file test

Terminal hiển thị:

```text
[3/4] Auto-generating test cases file...
```

Script tạo nội dung file test trong biến:

```js
const testSuiteContent = `...`;
```

Sau đó ghi ra file:

```js
const testFilePath = path.resolve(path.dirname(helpersPath), 'helpers.test.js');
fs.writeFileSync(testFilePath, testSuiteContent, 'utf8');
```

File được sinh ra là:

```text
frontend/src/utils/helpers.test.js
```

Ý nghĩa chuyên môn:

- Đây là bước test generation.
- AI hoặc test assistant tự viết test case dựa trên logic mã nguồn.
- File test sinh ra có cấu trúc giống test framework phổ biến như Jest hoặc Vitest.

Ví dụ file sinh ra có dạng:

```js
import { formatMoney, mapProductToCar } from './helpers.js';

describe('AEROTEC Helpers Test Suite', () => {
  it('formatMoney() should format prices above 1B VND with B suffix', () => {
    const result = formatMoney(1500000000);
    expect(result).toBe('1.5B VND');
  });
});
```

Giải thích:

- `describe()`: nhóm các test case liên quan.
- `it()`: một test case cụ thể.
- `expect()`: kết quả thực tế.
- `toBe()`: kết quả mong đợi.

Trong Testing, cấu trúc này giúp test rõ ràng, dễ đọc và dễ bảo trì.

### Bước 4: Chạy test trong thời gian thực

Terminal hiển thị:

```text
[4/4] Executing test runner in real-time...
```

Script import thật các hàm từ `helpers.js`:

```js
const fileUrl = 'file:///' + helpersPath.replace(/\\/g, '/');
const { formatMoney, mapProductToCar } = await import(fileUrl);
```

Sau đó chạy test bằng hàm `assert()` tự viết:

```js
function assert(testName, testFn) {
  try {
    testFn();
    console.log(`✓ ${testName}`);
    passed++;
  } catch (err) {
    console.log(`✗ ${testName}`);
    console.log(`Reason: ${err.message}`);
    failed++;
  }
}
```

Ý nghĩa chuyên môn:

- `assert()` là bước xác nhận kết quả.
- Nếu actual result đúng với expected result, test pass.
- Nếu actual result khác expected result, test fail.
- Mỗi test case là một phép so sánh giữa kết quả mong đợi và kết quả thực tế.

Ví dụ:

```js
const res = formatMoney(1500000000);
if (res !== "1.5B VND") {
  throw new Error(`Expected '1.5B VND' but got '${res}'`);
}
```

Giải thích:

- Input: `1500000000`
- Expected result: `"1.5B VND"`
- Actual result: kết quả thật từ hàm `formatMoney`
- Nếu hai giá trị giống nhau thì test pass.
- Nếu khác nhau thì test fail.

---

## 5. File Test Được Sinh Ra Có Ý Nghĩa Gì?

File `frontend/src/utils/helpers.test.js` là sản phẩm do script tạo ra ở bước 3.

File này dùng để lưu các test case dưới dạng mã nguồn. Về mặt ý tưởng, nó giúp biến kịch bản kiểm thử thành code có thể chạy lại nhiều lần.

Vai trò của file này:

- Ghi lại các test case mà AI đề xuất.
- Làm tài liệu kỹ thuật cho logic cần kiểm tra.
- Có thể dùng làm nền tảng để tích hợp vào Jest hoặc Vitest.
- Giúp dự án có regression test, tức là test lại sau mỗi lần sửa code.

Tuy nhiên, trong script hiện tại có hai kiểu test:

- File `helpers.test.js` được sinh ra để minh họa test generation.
- Các test thật được chạy trực tiếp bên trong `ai_test_runner.js` bằng hàm `assert()`.

Vì vậy, khi thuyết trình có thể nói:

> Script vừa sinh ra file test để lưu test case, vừa chạy trực tiếp các assertion để kiểm tra ngay kết quả trên terminal.

---

## 6. Vì Sao Có Test Pass Và Test Fail?

Khi chạy script, bạn có thể gặp kết quả:

```text
Tests Passed: 2
Tests Failed: 4
```

Điều này rất hữu ích cho môn Testing, vì nó thể hiện rõ sự khác nhau giữa expected result và actual result.

### Ví dụ 1: Sai khác định dạng tiền

Script kỳ vọng:

```text
280.000.000 VND
```

Nhưng code hiện tại trả về:

```text
280.0M VND
```

Ý nghĩa:

- Test không khớp với logic hiện tại của phần mềm.
- Có thể requirement đã thay đổi.
- Có thể test case cũ chưa được cập nhật.
- Có thể code đang sai nếu requirement yêu cầu định dạng đầy đủ.

### Ví dụ 2: Sai khác ngôn ngữ fallback

Script kỳ vọng:

```text
Contact
```

Nhưng code hiện tại trả về:

```text
Liên hệ
```

Ý nghĩa:

- Đây là lỗi do expected result chưa đồng bộ với ngôn ngữ hiện tại của hệ thống.
- Nếu hệ thống hướng tới người dùng Việt Nam, `Liên hệ` có thể là kết quả đúng.
- Test case cần được cập nhật để phản ánh requirement mới.

### Ví dụ 3: Sai khác logic mapping sản phẩm

Script kỳ vọng sản phẩm `Apex R-7` được map thành phụ tùng carbon đặc biệt.

Nhưng code hiện tại không có logic override riêng cho `Apex R-7`. Hàm `mapProductToCar()` chỉ lấy dữ liệu từ object `product` và fallback mặc định.

Ý nghĩa:

- Test đang kỳ vọng một yêu cầu chưa được implement.
- Đây có thể là bug trong code hoặc bug trong test case.
- Người kiểm thử cần đối chiếu với requirement để kết luận.

Kết luận quan trọng:

> Test fail không luôn luôn có nghĩa là code sai. Test fail có nghĩa là kết quả thực tế khác kết quả mong đợi. Sau đó tester cần phân tích xem lỗi nằm ở code, ở test case hay ở requirement.

---

## 7. Các Thuật Ngữ Chuyên Môn Cần Nắm

### Unit Test

Unit test là kiểm thử một đơn vị nhỏ của chương trình, thường là một hàm hoặc một module.

Trong demo này:

```text
formatMoney()
mapProductToCar()
```

là các unit được kiểm thử.

### Test Case

Test case là một trường hợp kiểm thử cụ thể, gồm:

- Input
- Expected result
- Actual result
- Kết luận pass hoặc fail

Ví dụ:

```text
Input: 1500000000
Expected result: 1.5B VND
Actual result: 1.5B VND
Status: Pass
```

### Assertion

Assertion là câu lệnh kiểm tra điều kiện đúng sai trong test.

Ví dụ:

```js
expect(result).toBe('1.5B VND');
```

Hoặc trong script:

```js
if (res !== "1.5B VND") throw new Error(...);
```

### Expected Result

Expected result là kết quả mong đợi theo requirement hoặc theo test case.

### Actual Result

Actual result là kết quả thật mà chương trình trả về khi chạy.

### Boundary Value Analysis

Boundary value analysis là kỹ thuật kiểm thử các giá trị ở ngưỡng quan trọng.

Ví dụ:

- Dưới 1 triệu
- Từ 1 triệu trở lên
- Từ 1 tỷ trở lên
- Giá trị không hợp lệ

### Edge Case

Edge case là trường hợp đặc biệt, ít xảy ra nhưng dễ gây lỗi.

Ví dụ:

- `NaN`
- `Infinity`
- `null`
- Object thiếu field
- Mảng ảnh rỗng

### Static Analysis

Static analysis là phân tích mã nguồn mà không cần chạy chương trình.

Trong demo, script in ra bước phân tích static analysis để mô phỏng AI đọc code và nhận diện hàm.

### AST

AST là viết tắt của Abstract Syntax Tree, nghĩa là cây cú pháp trừu tượng.

Trong thực tế, AST giúp công cụ hiểu cấu trúc code, ví dụ:

- Đâu là tên hàm
- Hàm nhận tham số gì
- Hàm return gì
- Có điều kiện `if` nào

Trong script hiện tại, phần AST là mô phỏng bằng cách in sẵn thông tin ra terminal.

### Test Runner

Test runner là công cụ chạy test và báo cáo kết quả.

Ví dụ phổ biến:

- Jest
- Vitest
- Mocha

Trong demo này, `ai_test_runner.js` tự đóng vai trò test runner đơn giản.

### Regression Testing

Regression testing là chạy lại test sau khi sửa code để đảm bảo chức năng cũ không bị hỏng.

File `helpers.test.js` có thể được dùng làm nền tảng cho regression testing.

---

## 8. Kịch Bản Thuyết Trình Ngắn Gọn

Bạn có thể trình bày như sau:

```text
Trong phần demo này, nhóm em sử dụng một script tên là ai_test_runner.js để mô phỏng công cụ AI-powered testing.

Đầu tiên, công cụ đọc file helpers.js, đây là file chứa các hàm xử lý dữ liệu sản phẩm ở frontend. Sau đó, công cụ nhận diện các hàm quan trọng như formatMoney và mapProductToCar.

Tiếp theo, công cụ xác định các chiến lược kiểm thử, ví dụ kiểm tra định dạng tiền, kiểm tra giá trị lớn hơn 1 tỷ, kiểm tra dữ liệu không hợp lệ như NaN và Infinity, cũng như kiểm tra việc mapping dữ liệu sản phẩm.

Sau khi có chiến lược test, công cụ tự sinh file helpers.test.js. File này chứa các test case theo cấu trúc gần giống Jest hoặc Vitest, gồm describe, it và expect.

Cuối cùng, script chạy các test case trực tiếp trên terminal. Mỗi test sẽ so sánh expected result với actual result. Nếu giống nhau thì pass, nếu khác nhau thì fail và in ra lý do.

Điểm quan trọng là khi có test fail, điều đó không nhất thiết chứng minh code sai. Nó chứng minh có sự khác biệt giữa kết quả mong đợi và kết quả thực tế. Tester cần kiểm tra lại requirement để quyết định cần sửa code hay sửa test case.
```

---

## 9. Nên Giải Thích Kết Quả Fail Như Thế Nào?

Nếu terminal hiển thị:

```text
Expected '280.000.000 VND' but got '280.0M VND'
```

Bạn có thể nói:

```text
Ở đây test case mong đợi định dạng tiền đầy đủ, nhưng logic hiện tại của hệ thống lại format theo đơn vị triệu. Đây là một test fail do expected result và actual result không đồng nhất. Tester cần kiểm tra requirement: nếu yêu cầu là hiển thị dạng triệu thì test case cần sửa, còn nếu yêu cầu là hiển thị đầy đủ thì code cần sửa.
```

Nếu terminal hiển thị:

```text
Expected 'Contact' but got 'Liên hệ'
```

Bạn có thể nói:

```text
Đây là sai khác về ngôn ngữ hiển thị. Test case kỳ vọng tiếng Anh, nhưng hệ thống hiện tại dùng tiếng Việt. Nếu website phục vụ người dùng Việt Nam thì actual result có thể đúng, và test case cần cập nhật.
```

Nếu terminal hiển thị:

```text
Expected name to be overridden
```

Bạn có thể nói:

```text
Test case kỳ vọng sản phẩm Apex R-7 được mapping sang thông tin phụ tùng đặc biệt. Tuy nhiên code hiện tại chưa có logic override này. Đây có thể là requirement chưa được implement hoặc là test case đang kỳ vọng sai.
```

---

## 10. Điểm Mạnh Và Hạn Chế Của Demo

### Điểm mạnh

- Dễ trình bày trước lớp.
- Thể hiện rõ luồng kiểm thử tự động.
- Có sinh file test thật.
- Có chạy test thật bằng assertion.
- Có báo cáo pass/fail rõ ràng.
- Giúp giải thích expected result và actual result rất trực quan.

### Hạn chế

- Script chưa dùng AI thật.
- Phần AST đang là mô phỏng, chưa parse code thật.
- Chưa tích hợp Jest hoặc Vitest.
- Một số expected result có thể chưa khớp với logic hiện tại.
- File `helpers.test.js` có thể bị ghi đè mỗi lần chạy script.

Khi thuyết trình, nên nói rõ:

```text
Đây là bản demo mô phỏng AI testing workflow. Trong hệ thống thực tế, phần phân tích code và sinh test case có thể được thực hiện bằng AI thật hoặc bằng các công cụ phân tích AST.
```

---

## 11. 10 Câu Hỏi Và Câu Trả Lời Chuẩn Bị Thuyết Trình

### Câu 1: Script này có phải là AI thật không?

Không hoàn toàn. Script này mô phỏng quy trình của một AI Test Assistant. Nó chưa gọi API AI thật, nhưng nó trình bày đúng luồng mà một công cụ AI testing có thể làm: đọc code, xác định test case, sinh file test và chạy test.

### Câu 2: Vì sao gọi là AI-powered testing nếu chưa dùng AI thật?

Vì mục tiêu của demo là minh họa cách AI có thể hỗ trợ testing. Trong thực tế, AI sẽ đảm nhận phần phân tích code và sinh test case. Trong script này, các bước đó được mô phỏng để phục vụ thuyết trình.

### Câu 3: File nào là file được kiểm thử?

File được kiểm thử là `frontend/src/utils/helpers.js`. Đây là file chứa các hàm xử lý dữ liệu như `formatMoney()` và `mapProductToCar()`.

### Câu 4: File nào được sinh ra bởi script?

Script sinh ra file `frontend/src/utils/helpers.test.js`. File này chứa các test case được tạo tự động để kiểm thử các hàm trong `helpers.js`.

### Câu 5: Vì sao cần sinh file test?

Sinh file test giúp lưu lại các test case dưới dạng code. Nhờ đó, tester hoặc developer có thể chạy lại test nhiều lần sau khi sửa code, giúp phát hiện lỗi hồi quy.

### Câu 6: Test pass nghĩa là gì?

Test pass nghĩa là actual result trùng với expected result. Nói cách khác, chương trình trả về đúng kết quả mà test case mong đợi.

### Câu 7: Test fail nghĩa là code sai phải không?

Không phải lúc nào cũng vậy. Test fail chỉ chứng minh actual result khác expected result. Lỗi có thể nằm ở code, ở test case hoặc ở requirement chưa rõ ràng.

### Câu 8: Vì sao test `formatMoney(280000000)` có thể fail?

Vì test case kỳ vọng `280.000.000 VND`, trong khi code hiện tại có thể trả về `280.0M VND`. Đây là khác biệt về quy tắc định dạng tiền.

### Câu 9: Vì sao kiểm tra `NaN` và `Infinity` quan trọng?

Vì đây là các edge case. Nếu không xử lý tốt, chương trình có thể hiển thị dữ liệu sai hoặc gây lỗi giao diện. Test các giá trị này giúp đảm bảo hàm ổn định với input không hợp lệ.

### Câu 10: Nếu muốn biến demo này thành test thật trong dự án thì cần làm gì?

Cần chuyển các test case sang framework chuẩn như Jest hoặc Vitest, cập nhật expected result theo requirement thật, sửa lỗi encoding tiếng Việt nếu có, và đưa test vào quy trình CI/CD để tự động chạy khi có thay đổi code.

---

## 12. Kết Luận

Script `ai_test_runner.js` là một demo tốt cho môn Testing vì nó thể hiện đầy đủ tư duy kiểm thử:

- Xác định đối tượng cần test.
- Thiết kế test case.
- Sinh mã kiểm thử.
- Chạy kiểm thử.
- So sánh expected result và actual result.
- Phân tích nguyên nhân test fail.

Thông điệp chính khi thuyết trình:

```text
AI-powered testing không chỉ giúp chạy test nhanh hơn, mà còn hỗ trợ suy nghĩ test case, phát hiện edge case và giảm công sức viết test thủ công. Tuy nhiên, tester vẫn cần hiểu requirement để đánh giá test fail là lỗi code hay lỗi test case.
```
