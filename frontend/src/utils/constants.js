export const videoStages = [
  {
    id: 'full',
    number: '01',
    title: 'Tháo lắp toàn bộ cấu trúc',
    subtitle: 'Mô hình 3D tháo rã chi tiết',
    src: '/videos/Sports_car_disassembling_mid-air_202605271729.mp4',
    points: ['Vỏ thân xe carbon', 'Khoang lái điều khiển', 'Khung gầm chịu tải'],
    narrative:
      'Giai đoạn tháo rã toàn bộ giúp người xem hình dung trực quan cách các tấm vỏ sợi carbon siêu nhẹ kết hợp cùng khung gầm chịu lực của siêu xe.',
  },
  {
    id: 'engine',
    number: '02',
    title: 'Hệ thống truyền động và động cơ',
    subtitle: 'Động cơ V8 Twin-Turbo nén áp',
    src: '/videos/Car_powertrain_V8_engine_exploded_202605271732.mp4',
    points: ['Lốc máy V8 hợp kim', 'Cổ hút khí nạp nén', 'Vùng tản nhiệt động năng'],
    narrative:
      'Tập trung sâu vào động cơ V8 hiệu năng cao: mô phỏng dòng khí nạp qua cổ hút CNC và sự phân bố nhiệt độ tại bầu xả titanium.',
  },
  {
    id: 'wheels',
    number: '03',
    title: 'Cụm bánh xe và hệ thống phanh',
    subtitle: 'Đĩa phanh gốm carbon & treo thích ứng',
    src: '/videos/Car_wheel_assembly_exploding_apart_202605271733.mp4',
    points: ['Đĩa phanh gốm carbon', 'Heo dầu phanh đa piston', 'Hình học hệ thống treo'],
    narrative:
      'Giai đoạn cuối phân tích hệ thống kiểm soát lực phanh, độ bám đường thông qua phanh gốm tản nhiệt cực nhanh và cơ cấu treo đa điểm Öhlins.',
  },
]

export const featuredCars = [
  {
    id: 1,
    name: 'Cánh Gió Đuôi Carbon Ép Apex',
    sku: 'AT-APEX-WING-01',
    type: 'Khí động học',
    price: '120.0 triệu VND',
    numericPrice: 120000000,
    material: 'Carbon Ép (Forged Carbon)',
    weightReduction: '-8.5 kg',
    gain: '+180 kg Lực ép downforce',
    brand: 'AEROTEC',
    stock: 5,
    rating: 4.9,
    description: 'Cánh gió đuôi khí động học chế tạo bằng carbon ép trong lò hấp autoclave áp suất cao, tối ưu lực ép gầm và giảm tối đa lực cản không khí ở tốc độ cao.',
    image: '/images/cars/apex-r7.png',
  },
  {
    id: 2,
    name: 'Hệ Thống Ống Xả Titanium Cổ Van Cao Cấp',
    sku: 'AT-TITAN-EXH-02',
    type: 'Động cơ',
    price: '280.0 triệu VND',
    numericPrice: 280000000,
    material: 'Titanium Grade 5',
    weightReduction: '-14.0 kg',
    gain: '+18 HP Công suất tăng thêm',
    brand: 'AEROTEC',
    stock: 3,
    rating: 5.0,
    description: 'Hệ thống ống xả xe đua siêu nhẹ làm bằng hợp kim titanium siêu chịu nhiệt. Có van biến thiên thông minh tích hợp trực tiếp theo chế độ lái của ECU.',
    image: '/images/cars/vector-gt.png',
  },
  {
    id: 3,
    name: 'Bộ Đĩa Phanh Gốm Carbon Ceramic-Matrix',
    sku: 'AT-CERAM-BRK-03',
    type: 'Hệ thống phanh',
    price: '350.0 triệu VND',
    numericPrice: 350000000,
    material: 'Hợp kim gốm Carbon (Silicon Carbide)',
    weightReduction: '-18.0 kg',
    gain: 'Không suy giảm lực phanh (Zero Fade)',
    brand: 'Brembo Spec',
    stock: 2,
    rating: 4.8,
    description: 'Đĩa phanh gốm carbon thông gió chịu được nhiệt độ ma sát cực hạn lên đến 1000°C. Đảm bảo hiệu suất phanh tối đa và loại bỏ hoàn toàn hiện tượng mất phanh do quá nhiệt.',
    image: '/images/cars/nova-x.png',
  },
  {
    id: 4,
    name: 'Hệ Thống Phuộc Nhún Điện Từ Active-Mag',
    sku: 'AT-MAG-SUSP-04',
    type: 'Hệ thống treo',
    price: '195.0 triệu VND',
    numericPrice: 195000000,
    material: 'Nhôm CNC Billet nguyên khối',
    weightReduction: '-3.2 kg',
    gain: 'Tần số phản hồi thích ứng 1000Hz',
    brand: 'Öhlins Spec',
    stock: 4,
    rating: 4.7,
    description: 'Bộ phuộc nhún từ lưu biến phản hồi siêu nhanh trong vòng phần nghìn giây. Đã trải qua các bài kiểm tra khắc nghiệt tại trường đua Nürburgring GP.',
    image: '/images/cars/AT-MAG-SUSP-04.png',
  },
  {
    id: 5,
    name: 'Cổ Hút Gió Nhôm CNC Nguyên Khối',
    sku: 'AT-CNC-INT-05',
    type: 'Động cơ',
    price: '85.0 triệu VND',
    numericPrice: 85000000,
    material: 'Nhôm hàng không 6061-T6',
    weightReduction: '-2.0 kg',
    gain: '+12 HP Công suất nạp khí',
    brand: 'AEROTEC',
    stock: 8,
    rating: 4.6,
    description: 'Họng hút khí nạp được gia công CNC 5 trục từ phôi nhôm hàng không nguyên tấm, tối ưu hóa đường truyền và lưu lượng không khí vào buồng đốt động cơ.',
    image: '/images/cars/AT-CNC-INT-05.png',
  },
  {
    id: 6,
    name: 'Bộ Điều Khiển ECU Động Cơ Thông Minh Neural',
    sku: 'AT-NEUR-ECU-06',
    type: 'Hệ thống điện',
    price: '110.0 triệu VND',
    numericPrice: 110000000,
    material: 'Chip bán dẫn Silicon / Hợp kim nhôm',
    weightReduction: '-0.5 kg',
    gain: '+35 HP Tối ưu hóa bản đồ Map lửa',
    brand: 'AEROTEC',
    stock: 7,
    rating: 4.9,
    description: 'Bộ xử lý ECU thế hệ mới tích hợp thuật toán phân tích telemetry sinh học của tài xế theo thời gian thực, tự động căn chỉnh thông số động cơ và lực kéo.',
    image: '/images/cars/AT-NEUR-ECU-06.png',
  },
  {
    id: 7,
    name: 'Bộ Khuếch Tán Gầm Khí Động Học Vortex',
    sku: 'AT-VORT-DIFF-07',
    type: 'Khí động học',
    price: '145.0 triệu VND',
    numericPrice: 145000000,
    material: 'Carbon Prepreg dệt sợi 3K',
    weightReduction: '-6.0 kg',
    gain: '+90 kg Lực ép gầm ở tốc độ cao',
    brand: 'AEROTEC',
    stock: 6,
    rating: 4.7,
    description: 'Bộ ốp khuếch tán gió gầm sau tạo hiệu ứng Venturi hút chặt gầm xe xuống mặt đường, giúp ổn định trục sau khi vào cua ở tốc độ trên 250 KM/H.',
    image: '/images/cars/AT-VORT-DIFF-07.png',
  },
  {
    id: 8,
    name: 'Bộ Mâm Đúc Nguyên Khối Forged Monoblock',
    sku: 'AT-MONO-RIM-08',
    type: 'Hệ thống treo',
    price: '220.0 triệu VND',
    numericPrice: 220000000,
    material: 'Mâm hợp kim nhôm Forged 6061-T6',
    weightReduction: '-24.0 kg toàn xe',
    gain: 'Giảm trọng lượng không treo (Unsprung Mass)',
    brand: 'Recaro Spec',
    stock: 4,
    rating: 4.8,
    description: 'Bộ mâm nhôm đúc áp lực siêu bền cho xe đua. Thiết kế đa nan tản nhiệt tối ưu luồng gió làm mát cho cụm phanh gốm carbon bên trong.',
    image: '/images/cars/AT-MONO-RIM-08.png',
  },
]

export const inventorySorts = [
  { label: 'Đánh giá cao nhất', sortBy: 'rating', sortOrder: 'DESC' },
  { label: 'Mới nhất', sortBy: 'createdAt', sortOrder: 'DESC' },
  { label: 'Bán chạy nhất', sortBy: 'soldCount', sortOrder: 'DESC' },
  { label: 'Giá từ cao đến thấp', sortBy: 'price', sortOrder: 'DESC' },
  { label: 'Giá từ thấp đến cao', sortBy: 'price', sortOrder: 'ASC' },
  { label: 'Tên chữ cái A-Z', sortBy: 'name', sortOrder: 'ASC' },
]

export const guestCartKey = 'dalta_guest_cart'

export const ARTICLES_DATA = [
  {
    id: 1,
    title: 'Sợi Carbon lò hấp Autoclave: Định nghĩa lại độ cứng cấu trúc',
    subtitle: 'Cách quy trình sấy nhiệt độ cao và hút chân không nén ép làm thay đổi tính chất vật lý của sợi carbon prepreg.',
    category: 'Khoa học vật liệu',
    readTime: '6 phút đọc',
    date: '24 THÁNG 5, 2026',
    author: 'Tiến sĩ Jun-ho Park, Trưởng bộ phận Luyện kim',
    image: '/images/cars/apex-r7.png',
    synopsis: 'Phân tích chu kỳ hấp nén áp suất lò autoclave. Cân chỉnh giãn nở nhiệt giữa khuôn nhôm hàng không và ma trận nhựa epoxy carbon. Kiểm soát áp suất 6 bar trong pha làm nguội giúp tăng 22% mô-đun đàn hồi của cánh gió sau.',
    content: `Quy trình tôi luyện carbon trong lò hấp nhiệt độ cao (Autoclave) đại diện cho đỉnh cao của kỹ thuật vật liệu composite. Trong báo cáo nghiên cứu này, chúng tôi đánh giá sự tối ưu hóa của các chu kỳ nhiệt đối với các tấm sợi carbon pre-impregnated (prepreg). Bằng cách tính toán khớp hệ số giãn nở nhiệt của khuôn nhôm hàng không CNC với ma trận carbon-epoxy, chúng tôi đã loại bỏ hoàn toàn các vết nứt delamination siêu vi giữa các lớp sợi dệt.

    Trong giai đoạn làm nguội cuối cùng, áp suất lò được duy trì chính xác ở mức 6 bar trong khi nhiệt độ giảm đều đặn 1.5°C mỗi phút. Các phép đo đạc quang học chứng minh rằng việc kiểm soát chặt chẽ này ngăn chặn các ứng suất nội dư thừa bên trong vật liệu, giúp cánh gió carbon đạt độ cứng kéo lớn hơn 22% so với phương pháp hút chân không thông thường mà không làm tăng dù chỉ 1 gram trọng lượng. Công nghệ này đang được ứng dụng trực tiếp trên dòng cánh gió Apex của siêu xe đua.`,
    formulas: [
      { label: 'Động học tăng nhiệt lượng lò hấp', equation: 'T(t) = T_0 + \\beta \\cdot t \\quad [\\beta = 1.5^\\circ\\text{C/phút}]', desc: 'Kiểm soát tốc độ gia nhiệt để ngăn nhựa epoxy đóng rắn quá nhanh gây bọt khí giữa các lớp dệt.' },
      { label: 'Mô-đun Young kéo đứt Composite', equation: 'E_c = \\frac{V_f E_f + (1 - V_f) E_m}{1 - \\nu^2} \\quad [E_c = 720\\text{ GPa}]', desc: 'Công thức tính toán độ cứng của chi tiết dựa trên tỷ lệ thể tích sợi dệt carbon trong lõi nhựa.' }
    ],
    compatibleParts: [
      { name: 'Cánh Gió Đuôi Carbon Ép Apex', sku: 'AT-APEX-WING-01', price: '120.0 triệu VND' },
      { name: 'Hệ Thống Ống Xả Titanium Cổ Van Cao Cấp', sku: 'AT-TITAN-EXH-02', price: '280.0 triệu VND' }
    ]
  },
  {
    id: 2,
    title: 'Cân chỉnh bộ não ECU thông minh: Phân tích Telemetry sinh học tài xế',
    subtitle: 'Ứng dụng các module mạng nơ-ron học máy để lập bản đồ phản xạ lực kéo trên đường đua.',
    category: 'Điện tử & Động cơ',
    readTime: '8 phút đọc',
    date: '18 THÁNG 4, 2026',
    author: 'Sarah Jenkins, Trưởng kỹ sư ECU',
    image: '/images/cars/nova-x.png',
    synopsis: 'Tích hợp cảm biến sinh học cơ thể tài xế vào phản hồi chân ga của xe. Bằng cách ghi nhận độ bám vô lăng, nhịp tim và mô-men lái tại tốc độ 1000Hz, bộ vi xử lý điều chỉnh công suất đẩy để đồng điệu hoàn hảo với phản xạ người lái.',
    content: `Các dòng siêu xe đua hiện đại sản sinh lượng công suất vượt quá giới hạn xử lý tự nhiên của con người trong các điều kiện thời tiết khắc nghiệt. Để giải quyết điều này, AEROTEC đã phát triển bộ não Neural ECU v4.0. Thay vì sử dụng bản đồ Map chân ga tĩnh, bộ xử lý này theo dõi mô-men trục lái, độ trượt của từng lốp xe và cảm biến lực bám lòng bàn tay của người lái ở tần số quét 1000Hz.

    Thông qua một mạng nơ-ron tích hợp nhẹ chạy trực tiếp trên chip xử lý nhôm silicon chịu nhiệt, hệ thống có thể dự đoán hiện tượng mất bám của lốp trước 150 mili giây. Hệ thống sẽ tinh chỉnh mô-men xoắn của động cơ theo từng góc bánh xe một cách vô cùng êm ái, hỗ trợ chấn chỉnh thân xe mà không gây cảm giác can thiệp giật cục như các hệ thống cân bằng điện tử truyền thống. Lực truyền động được kết nối tự nhiên như một phần kéo dài của cơ thể tài xế.`,
    formulas: [
      { label: 'Ánh xạ véc-tơ công suất nơ-ron chân ga', equation: '\\theta_{\\text{throttle}}(t) = \\sigma\\left(\\mathbf{W}^{\\top} \\mathbf{x}(t) + b\\right) \\quad [\\mathbf{x} = \\{\\omega, \\tau, \\mathbf{g}_{grip}\\}]', desc: 'Thuật toán kết hợp tốc độ trượt bánh, mô-men vô lăng và cảm biến tay nắm để tính toán độ mở van nạp khí.' },
      { label: 'Cân bằng mô-men lệch trục thân xe', equation: 'M_z = I_z \\dot{r} = a F_{yf} - b F_{yr} + \\Delta M_z', desc: 'Điều chỉnh lượng phân bổ mô-men xoắn vi sai chủ động để thân xe không bị xoay trượt mất kiểm soát.' }
    ],
    compatibleParts: [
      { name: 'Bộ Điều Khiển ECU Động Cơ Thông Minh Neural', sku: 'AT-NEUR-ECU-06', price: '110.0 triệu VND' },
      { name: 'Bộ Đĩa Phanh Gốm Carbon Ceramic-Matrix', sku: 'AT-CERAM-BRK-03', price: '350.0 triệu VND' }
    ]
  },
  {
    id: 3,
    title: 'Thử nghiệm hầm gió khí động học: Tối ưu lực ép Venturi gầm xe',
    subtitle: 'Phân tích cơ học dòng khí chuyển động nhanh bên dưới khung gầm ở vận tốc trên Mach 0.3.',
    category: 'Khí động học',
    readTime: '7 phút đọc',
    date: '30 THÁNG 3, 2026',
    author: 'Min-kyu Kim, Trưởng nhóm khí động học',
    image: '/images/cars/vector-gt.png',
    synopsis: 'Đo đạc khí động học mặt dưới xe bằng hệ thống laser Doppler chuyên sâu. Báo cáo chi tiết cách thiết lập các dòng xoáy không khí trong ống dẫn Venturi dưới gầm sau để đạt lực ép bổ sung 90kg tại 250 KM/H.',
    content: `Khí động học hiệu ứng gầm (ground effect) vô cùng nhạy cảm với độ cao gầm xe và độ nghiêng của khung máy. Sử dụng hầm gió khí động học chuyên dụng của Atelier, chúng tôi đã sử dụng hệ thống đo laser Doppler để ghi lại véc-tơ chuyển động của luồng không khí đi qua bên dưới gầm xe đua.

    Mục tiêu cốt lõi là trì hoãn hiện tượng tách lớp khí biên bên trong các ống dẫn khí Venturi ở gầm sau. Bằng cách thiết kế thêm các cụm tạo gió xoáy siêu nhỏ (micro-vortex generators) tại mép dẫn gầm trước, chúng tôi gia tốc dòng chảy, ép chặt luồng khí bám sát vào bề mặt khuếch tán sau ngay cả khi xe hạ sát gầm. Giải pháp này đem lại thêm 90kg lực ép thẳng đứng tại vận tốc 250 KM/H mà hoàn toàn không tạo thêm bất kỳ lực cản gió kéo lùi nào, giúp xe cân bằng vững chắc khi bắt đầu phanh gắt vào cua hiểm ở tốc độ cao.`,
    formulas: [
      { label: 'Tính lực ép khí động học thẳng đứng', equation: 'D_{\\text{downforce}} = \\frac{1}{2} C_L \\cdot \\rho \\cdot v^2 \\cdot A \\quad [C_L = 2.84]', desc: 'Phương trình tính toán lực ép hút xe xuống mặt đường dựa trên hệ số lực nhấc và diện tích gầm.' },
      { label: 'Hệ số Reynolds dòng chảy lớp biên', equation: 'Re_x = \\frac{\\rho v x}{\\mu} \\quad [Re_x < 5 \\times 10^5 \\text{ Laminar}]', desc: 'Đo lường mức độ hỗn loạn của luồng khí nhằm ngăn dòng chảy bị tách lớp khỏi thành ống khuếch tán gầm.' }
    ],
    compatibleParts: [
      { name: 'Bộ Khuếch Tán Gầm Khí Động Học Vortex', sku: 'AT-VORT-DIFF-07', price: '145.0 triệu VND' },
      { name: 'Cánh Gió Đuôi Carbon Ép Apex', sku: 'AT-APEX-WING-01', price: '120.0 triệu VND' }
    ]
  }
]
