const { provinceEnum } = require('../utils/constants/provinces');

const activity_state = [
  'pre_register',
  'registering',
  'end_register',
  'actual_date',
  'finished',
  'cancel',
];

const { ActivityService, PartnerService } = require('../services');

// const data = {
//   partner: '5fd5930e0cde09272c47c705',
//   activity_picture_url:
//     'https://ev.runlah.com/api/1/images/e--CeYGXmCR1jE-banner.jpg?size=xl',
//   title: 'ศรีภูมิรัน 2021 สุวรรณภูมิ นครแห่งช้างเผือก',
//   sub_title: 'มูลนิธิเจ้าแก้วมงคล',
//   description:
//     'ส่งเสริมสนับสนุนผู้ที่ชื่นชอบการออกกำลังกายและการวิ่ง เพื่อสร้างการรับรู้ และประชาสัมพันธ์ด้านเมืองประวัติศาสตร์ เมืองสุวรรณภูมิ บรรพชนคนร้อยเอ็ด โดย มูลนิธิเจ้าแก้วมงคล ร่วมกับ ชมรมเภสัชกรโรงพยาบาลชุมชน กระทรวงสาธารณสุข และ ชมรมกำนันผู้ใหญ่บ้านอำเภอสุวรรณภูมิ จังหวัดร้อยเอ็ด โดยรายได้หลังหักค่าใช้จ่าย เป็นกองทุนด้านการศึกษา ประวัติศาสตร์ วัฒนธรรม ของมูลนิธิเจ้าแก้วมงคล, การพัฒนาศักยภาพผู้นำปกครองท้องที่อำเภอสุวรรณภูมิ และพัฒนาบทบาทวิชาชีพเภสัชกรในโรงพยาบาลชุมชมต่อสาธารณะ',
//   location: {
//     lat: 15.6094318,
//     lng: 103.805447,
//     province: 'ร้อยเอ็ด',
//     place_name: 'โดม45ปีสุวรรณพิทย์',
//   },
//   actual_date: new Date('2021-2-7'),
//   register_start_date: new Date('2020-11-15'),
//   register_end_date: new Date('2021-1-5'),
//   courses: [
//     {
//       id: '1',
//       title: 'แฟมิลี่ ฟันรัน 3.5 กม.',
//       range: 3.5,
//       price: 300,
//       course_picture_url:
//         'https://ev.runlah.com/api/1/images/st--CeYGXmCR1jE-PzXn9FMDi.jpg?size=xl',
//     },
//     {
//       id: '2',
//       title: 'ฟันรัน 5.5 กม.',
//       range: 5.5,
//       price: 400,
//       course_picture_url:
//         'https://ev.runlah.com/api/1/images/st--CeYGXmCR1jE-_iUTyf5Cd.jpg?size=xl',
//     },
//     {
//       id: '3',
//       title: 'มินิมาราธอน 10.5 กม.',
//       range: 10.5,
//       price: 500,
//       course_picture_url:
//         'https://ev.runlah.com/api/1/images/st--CeYGXmCR1jE-O4LETDc5i.jpg?size=xl',
//     },
//     {
//       id: '4',
//       title:
//         'VIP – เสื้อวีไอพี, เหรียญวีไอพี, โล่วีไอพี, เหรียญเจ้าแก้วมงคล + ชิพจับเวลา 5.5',
//       range: 10.5,
//       price: 1000,
//       course_picture_url:
//         'https://ev.runlah.com/api/1/images/st--CeYGXmCR1jE-_iUTyf5Cd.jpg?size=xl',
//     },
//     {
//       id: '5',
//       title:
//         'VIP – เสื้อวีไอพี, เหรียญวีไอพี, โล่วีไอพี, เหรียญเจ้าแก้วมงคล + ชิพจับเวลา 10.5',
//       range: 10.5,
//       price: 1000,
//       course_picture_url:
//         'https://ev.runlah.com/api/1/images/st--CeYGXmCR1jE-O4LETDc5i.jpg?size=xl',
//     },
//     {
//       id: '6',
//       title:
//         'Super VIP – เสื้อคอปก ซุปเปอร์วีไอพี, เสื้อวีไอพี, ถ้วยวีไอพี, เหรียญเจ้าแก้วมงคลขนาดกลาง + ชิพจับเวลา 5.5',
//       range: 10.5,
//       price: 2500,
//       course_picture_url:
//         'https://ev.runlah.com/api/1/images/st--CeYGXmCR1jE-_iUTyf5Cd.jpg?size=xl',
//     },
//     {
//       id: '7',
//       title:
//         'Super VIP – เสื้อคอปก ซุปเปอร์วีไอพี, เสื้อวีไอพี, ถ้วยวีไอพี, เหรียญเจ้าแก้วมงคลขนาดกลาง + ชิพจับเวลา 10.5',
//       range: 10.5,
//       price: 25000,
//       course_picture_url:
//         'https://ev.runlah.com/api/1/images/st--CeYGXmCR1jE-O4LETDc5i.jpg?size=xl',
//     },
//   ],
//   gifts: [
//     {
//       id: '1',
//       description: 'ถ้วยรางวัล',
//       gift_picture_url:
//         'https://ev.runlah.com/api/1/images/st--CeYGXmCR1jE-FRheY-O1m.jpg?size=xl',
//     },
//     {
//       id: '2',
//       description: 'รางวัล',
//       gift_picture_url:
//         'https://ev.runlah.com/api/1/images/st--CeYGXmCR1jE-czCGrMu9S.jpg?size=xl',
//     },
//   ],
//   timeline: [
//     {
//       id: '1',
//       time: '04:30 - 05:00',
//       title: 'ลงทะเบียน นักวิ่ง',
//       description: '',
//     },
//     {
//       id: '2',
//       time: '05:00 - 05:30',
//       title: 'กิจกรรม',
//       description:
//         'กิจกรรม วอร์มอัพ เตรียมความพร้อม สื่อ แสง เสียง ประชาสัมพันธ์ การรับรู้ “สุวรรณภูมิ นครแห่งช้างเผือก”',
//     },
//     {
//       id: '3',
//       time: '05:30',
//       title: 'ปล่อยตัวนักวิ่งระยะ 10.5 กม.',
//       description: '',
//     },
//     {
//       id: '4',
//       time: '05:45',
//       title: 'ปล่อยตัวนักวิ่ง ระยะ 5.5 กม.',
//       description: '',
//     },
//     {
//       id: '5',
//       time: '06:00',
//       title: 'ปล่อยตัวนักวิ่ง ระยะ 3.5 กม. *',
//       description: '',
//     },
//     {
//       id: '6',
//       time: '08:00 - 09:30',
//       title: 'ปิดกิจกรรม',
//       description:
//         'มอบรางวัลผู้ชนะการแข่งขันประเภทต่างๆ มอบเกียรติบัตรผู้สนับสนุน ทุกรายการ อื่นๆ ปิดการจัดงาน',
//     },
//   ],
//   rules: [
//     {
//       id: '1',
//       title: 'รางวัล Overall จำนวน 1 รางวัล (ชาย/หญิง)',
//       detail: [
//         {
//           id: '1',
//           description: 'โอเวอร์ออล อันดับที่ 1 ชาย 2,500 บาท',
//         },
//         {
//           id: '2',
//           description: 'โอเวอร์ออล อันดับที่ 1 หญิง 2,500 บาท',
//         },
//       ],
//     },
//     {
//       id: '2',
//       title: 'รางวัลรุ่นอายุ อันดับที่ 1 - 5 (ชาย/หญิง)',
//       detail: [
//         {
//           id: '1',
//           description: 'รุ่นอายุ อันดับที่ 1 1,000 บาท',
//         },
//         {
//           id: '2',
//           description: 'รุ่นอายุ อันดับที่ 2 800 บาท',
//         },
//         {
//           id: '3',
//           description: 'รุ่นอายุ อันดับที่ 3 600 บาท',
//         },
//         {
//           id: '4',
//           description: 'รุ่นอายุ อันดับที่ 4 400 บาท',
//         },
//       ],
//     },
//   ],
//   more_detail: [
//     {
//       id: '1',
//       description: 'สอบถามข้อมูลทั่วไป (ผู้จัดการแข่งขัน)',
//     },
//     { id: '2', description: 'E-Mail : Sp.sriphume@gmail.com' },
//     { id: '3', description: 'Call : +66 (0)6 1906 4429' },
//     {
//       id: '1',
//       description: 'สอบถามเกี่ยวกับการสมัคร (รันลา)',
//     },
//     { id: '2', description: 'Line@ : https://lin.ee/BTOwTuz' },
//     { id: '3', description: 'Call : +66 (0)8 1818 6155' },
//   ],
//   shirt_detail: [
//     {
//       id: '1',
//       style: 'เสื้อที่ระลึก ซุปเปอร์วีไอพี',
//       shirt_picturl_url:
//         'https://ev.runlah.com/api/1/images/st--CeYGXmCR1jE-I3e3i6MD1.jpg?size=xl',
//     },
//     {
//       id: '2',
//       style: 'เสื้อที่ระลึก วีไอพี',
//       shirt_picturl_url:
//         'https://ev.runlah.com/api/1/images/st--CeYGXmCR1jE-Cf0RUAc4z.jpg?size=xl',
//     },
//     {
//       id: '3',
//       style: 'เสื้อที่ระลึก 10.5 กิโลเมตร',
//       shirt_picturl_url:
//         'https://ev.runlah.com/api/1/images/st--CeYGXmCR1jE-7ID6Ce5bV.jpg?size=xl',
//     },
//     {
//       id: '4',
//       style: 'เสื้อที่ระลึก 5.5 กิโลเมตร',
//       shirt_picturl_url:
//         'https://ev.runlah.com/api/1/images/st--CeYGXmCR1jE-FCKXlI19x.jpg?size=xl',
//     },
//     {
//       id: '5',
//       style: 'เสื้อที่ระลึก 3.5 กิโลเมตร',
//       shirt_picturl_url:
//         'https://ev.runlah.com/api/1/images/st--CeYGXmCR1jE-RobmksUDl.jpg?size=xl',
//     },
//   ],
//   size: [
//     {
//       id: '1',
//       size: 's',
//       description: 'รอบอก 36"',
//     },
//     {
//       id: '2',
//       size: 'm',
//       description: 'รอบอก 38"',
//     },
//     {
//       id: '3',
//       size: 'l',
//       description: 'รอบอก 40"',
//     },
//     {
//       id: '4',
//       size: 'xl',
//       description: 'รอบอก 42"',
//     },
//   ],
//   condition: [
//     {
//       id: '1',
//       description:
//         'ข้าพเจ้าขอรับรองว่าข้อความข้างต้นเป็นความจริง ซึ่งข้าพเจ้ามีสภาพร่างกายสมบูรณ์พร้อม และสามารถลงแข่งขันในประเภทที่ลงสมัคร และจะปฏิบัติตามกฎกติกาทุกประการโดยไม่เรียกร้องค่าเสียหายใดๆ หากเกิดอันตราย หรือบาดเจ็บ ทั้งก่อน และระหว่างแข่งขัน อีกทั้งยินดีแสดงหลักฐานพิสูจน์ตนเองต่อผู้จัด และยินยอมให้ผู้จัดถ่ายภาพเคลื่อนไหว เพื่อบันทึกการแข่งขัน และถือเป็นลิขสิทธิ์ของผู้จัด ในกรณีกิจกรรมนี้ต้องยกเลิกทั้งหมด หรือส่วนใดส่วนหนึ่ง โดยสืบเนื่องจากสาเหตุสุดวิสัยใดๆ ทางธรรมชาติ หรือภาวะอื่นใดก็ตาม',
//     },
//     {
//       id: '2',
//       description:
//         'ข้าพเจ้าทราบ และยินยอมว่าจะไม่มีการคืนเงินค่าสมัครให้แก่ข้าพเจ้า',
//     },
//   ],
//   state: 'pre_register',
//   rules1: [
//     {
//       id: '1',
//       title: 'กติกาของงานซึ่งผู้สมัครเข้าร่วมการแข่งขันต้องยอมรับและปฏิบัติตาม',
//     },
//     {
//       id: '2',
//       title: '1. กติกาของงานสอดคล้องกับกฎหมาย',
//     },
//     {
//       id: '3',
//       title:
//         '2. นอกจากกติกาของงานแล้ว ยังประกอบด้วยกติกาการแข่งขัน และกติกาในการสมัคร',
//     },
//     {
//       id: '4',
//       title:
//         '3. นักวิ่งผู้เข้าร่วมจะถูกปฏิบัติตามข้อควรระวังของผู้จัดงานเพื่อให้แน่ใจว่าผู้เข้าร่วมเกิดความปลอดภัย และผู้เข้าร่วมจะทำการวิ่งโดยยอมรับความเสี่ยงของตนเอง และผู้จัดงานจะไม่รับผิดชอบหรือต้องระวางโทษต่อการบาดเจ็บหรือเสียชีวิต ไม่ว่ากรณีฝึกซ้อมหรือระหว่างเข้าร่วมแข่งขัน ทั้งนี้ ผู้เข้าร่วมควรพบแพทย์หรือที่ปรึกษาทางสุขภาพก่อนทำการลงทะเบียน และก่อนวันแข่งขันจริง',
//     },
//     {
//       id: '5',
//       title:
//         '4. ผู้จัดไม่รับผิดชอบในความเสียหายที่เกิดจากสิ่งต่อไปนี้: o (ก) ความเจ็บป่วยหรืออุบัติเหตุ (ผู้จัดจะจัดเตรียมแพทย์ พยาบาล อาสาสมัคร และเจ้าหน้าที่เพื่อช่วยเหลือในกรณีฉุกเฉิน และมีการทำประกันภัยให้แก่นักวิ่งที่เข้าร่วมทุกคน) o (ข) การสูญหายหรือเสียหายของทรัพย์สินส่วนบุคคล o (ค) การล่าช้าของการแข่งขันที่เกิดจากสิ่งที่ผู้จัดควบคุมไม่ได้',
//     },
//   ],
// };

const data = {
  partner: '5fd5930e0cde09272c47c705',
  activity_picture_url:
    'https://ev.runlah.com/api/1/images/e-NZcb5G9wEG3-banner.jpg?size=xl',
  title: 'อัลตร้า-เทรล ห้วยยาง 2020',
  sub_title: 'จัดซื้อเตียงนอนสำหรับผู้ป่วยอัมพาตติดเตียง',
  description:
    'บ.เนเวอเรสท์ ร่วมกับ เทศบาลตำบลห้วยยาง จ.ชัยภูมิ จัดการวิ่งอัลตร้าเทรลให้นักวิ่งได้สัมผัสสายน้ำผุดที่ใสเย็น ภายใต้อ้อมกอดของขุนเขา เพื่อส่งเสริมการท่องเที่ยวและกระตุ้นเศรษฐกิจในระดับชุมชนของจังหวัดชัยภูมิ และสาธารณะกุศล รายได้หลังหักค่าใช้จ่ายเพื่อปรับปรุงห้องน้ำที่สวนรุกขชาติน้ำผุดทัพลาวและมอบให้กองทุนผู้พิทักษ์ป่า และจัดซื้อเตียงนอนสำหรับผู้ป่วยอัมพาตติดเตียง',
  location: {
    lat: 16.5442098,
    lng: 101.8488139,
    province: 'ชัยภูมิ',
    place_name: 'น้ำผุดทัพลาว',
  },
  actual_date: new Date('2021-4-19'),
  register_start_date: new Date('2020-1-10'),
  register_end_date: new Date('2021-2-20'),
  courses: [
    {
      id: '1',
      title: 'แฟมิลี่ ฟันรัน 3.5 กม.',
      range: 3.5,
      price: 300,
      course_picture_url:
        'https://ev.runlah.com/api/1/images/st--CeYGXmCR1jE-PzXn9FMDi.jpg?size=xl',
    },
    {
      id: '2',
      title: 'ฟันรัน 5.5 กม.',
      range: 5.5,
      price: 400,
      course_picture_url:
        'https://ev.runlah.com/api/1/images/st--CeYGXmCR1jE-_iUTyf5Cd.jpg?size=xl',
    },
    {
      id: '3',
      title: 'มินิมาราธอน 10.5 กม.',
      range: 10.5,
      price: 500,
      course_picture_url:
        'https://ev.runlah.com/api/1/images/st--CeYGXmCR1jE-O4LETDc5i.jpg?size=xl',
    },
    {
      id: '4',
      title:
        'VIP – เสื้อวีไอพี, เหรียญวีไอพี, โล่วีไอพี, เหรียญเจ้าแก้วมงคล + ชิพจับเวลา 5.5',
      range: 10.5,
      price: 1000,
      course_picture_url:
        'https://ev.runlah.com/api/1/images/st--CeYGXmCR1jE-_iUTyf5Cd.jpg?size=xl',
    },
    {
      id: '5',
      title:
        'VIP – เสื้อวีไอพี, เหรียญวีไอพี, โล่วีไอพี, เหรียญเจ้าแก้วมงคล + ชิพจับเวลา 10.5',
      range: 10.5,
      price: 1000,
      course_picture_url:
        'https://ev.runlah.com/api/1/images/st--CeYGXmCR1jE-O4LETDc5i.jpg?size=xl',
    },
    {
      id: '6',
      title:
        'Super VIP – เสื้อคอปก ซุปเปอร์วีไอพี, เสื้อวีไอพี, ถ้วยวีไอพี, เหรียญเจ้าแก้วมงคลขนาดกลาง + ชิพจับเวลา 5.5',
      range: 10.5,
      price: 2500,
      course_picture_url:
        'https://ev.runlah.com/api/1/images/st--CeYGXmCR1jE-_iUTyf5Cd.jpg?size=xl',
    },
    {
      id: '7',
      title:
        'Super VIP – เสื้อคอปก ซุปเปอร์วีไอพี, เสื้อวีไอพี, ถ้วยวีไอพี, เหรียญเจ้าแก้วมงคลขนาดกลาง + ชิพจับเวลา 10.5',
      range: 10.5,
      price: 25000,
      course_picture_url:
        'https://ev.runlah.com/api/1/images/st--CeYGXmCR1jE-O4LETDc5i.jpg?size=xl',
    },
  ],
  gifts: [
    {
      id: '1',
      description: 'ถ้วยรางวัล',
      gift_picture_url:
        'https://ev.runlah.com/api/1/images/st--CeYGXmCR1jE-FRheY-O1m.jpg?size=xl',
    },
    {
      id: '2',
      description: 'รางวัล',
      gift_picture_url:
        'https://ev.runlah.com/api/1/images/st--CeYGXmCR1jE-czCGrMu9S.jpg?size=xl',
    },
  ],
  timeline: [
    {
      id: '1',
      time: '04:30 - 05:00',
      title: 'ลงทะเบียน นักวิ่ง',
      description: '',
    },
    {
      id: '2',
      time: '05:00 - 05:30',
      title: 'กิจกรรม',
      description:
        'กิจกรรม วอร์มอัพ เตรียมความพร้อม สื่อ แสง เสียง ประชาสัมพันธ์ การรับรู้ “สุวรรณภูมิ นครแห่งช้างเผือก”',
    },
    {
      id: '3',
      time: '05:30',
      title: 'ปล่อยตัวนักวิ่งระยะ 10.5 กม.',
      description: '',
    },
    {
      id: '4',
      time: '05:45',
      title: 'ปล่อยตัวนักวิ่ง ระยะ 5.5 กม.',
      description: '',
    },
    {
      id: '5',
      time: '06:00',
      title: 'ปล่อยตัวนักวิ่ง ระยะ 3.5 กม. *',
      description: '',
    },
    {
      id: '6',
      time: '08:00 - 09:30',
      title: 'ปิดกิจกรรม',
      description:
        'มอบรางวัลผู้ชนะการแข่งขันประเภทต่างๆ มอบเกียรติบัตรผู้สนับสนุน ทุกรายการ อื่นๆ ปิดการจัดงาน',
    },
  ],
  rules: [
    {
      id: '1',
      title: 'รางวัล Overall จำนวน 1 รางวัล (ชาย/หญิง)',
      detail: [
        {
          id: '1',
          description: 'โอเวอร์ออล อันดับที่ 1 ชาย 2,500 บาท',
        },
        {
          id: '2',
          description: 'โอเวอร์ออล อันดับที่ 1 หญิง 2,500 บาท',
        },
      ],
    },
    {
      id: '2',
      title: 'รางวัลรุ่นอายุ อันดับที่ 1 - 5 (ชาย/หญิง)',
      detail: [
        {
          id: '1',
          description: 'รุ่นอายุ อันดับที่ 1 1,000 บาท',
        },
        {
          id: '2',
          description: 'รุ่นอายุ อันดับที่ 2 800 บาท',
        },
        {
          id: '3',
          description: 'รุ่นอายุ อันดับที่ 3 600 บาท',
        },
        {
          id: '4',
          description: 'รุ่นอายุ อันดับที่ 4 400 บาท',
        },
      ],
    },
  ],
  more_detail: [
    {
      id: '1',
      description: 'สอบถามข้อมูลทั่วไป (ผู้จัดการแข่งขัน)',
    },
    { id: '2', description: 'E-Mail : Sp.sriphume@gmail.com' },
    { id: '3', description: 'Call : +66 (0)6 1906 4429' },
    {
      id: '1',
      description: 'สอบถามเกี่ยวกับการสมัคร (รันลา)',
    },
    { id: '2', description: 'Line@ : https://lin.ee/BTOwTuz' },
    { id: '3', description: 'Call : +66 (0)8 1818 6155' },
  ],
  shirt_detail: [
    {
      id: '1',
      style: 'เสื้อที่ระลึก ซุปเปอร์วีไอพี',
      shirt_picturl_url:
        'https://ev.runlah.com/api/1/images/st--CeYGXmCR1jE-I3e3i6MD1.jpg?size=xl',
    },
    {
      id: '2',
      style: 'เสื้อที่ระลึก วีไอพี',
      shirt_picturl_url:
        'https://ev.runlah.com/api/1/images/st--CeYGXmCR1jE-Cf0RUAc4z.jpg?size=xl',
    },
    {
      id: '3',
      style: 'เสื้อที่ระลึก 10.5 กิโลเมตร',
      shirt_picturl_url:
        'https://ev.runlah.com/api/1/images/st--CeYGXmCR1jE-7ID6Ce5bV.jpg?size=xl',
    },
    {
      id: '4',
      style: 'เสื้อที่ระลึก 5.5 กิโลเมตร',
      shirt_picturl_url:
        'https://ev.runlah.com/api/1/images/st--CeYGXmCR1jE-FCKXlI19x.jpg?size=xl',
    },
    {
      id: '5',
      style: 'เสื้อที่ระลึก 3.5 กิโลเมตร',
      shirt_picturl_url:
        'https://ev.runlah.com/api/1/images/st--CeYGXmCR1jE-RobmksUDl.jpg?size=xl',
    },
  ],
  size: [
    {
      id: '1',
      size: 's',
      description: 'รอบอก 36"',
    },
    {
      id: '2',
      size: 'm',
      description: 'รอบอก 38"',
    },
    {
      id: '3',
      size: 'l',
      description: 'รอบอก 40"',
    },
    {
      id: '4',
      size: 'xl',
      description: 'รอบอก 42"',
    },
  ],
  condition: [
    {
      id: '1',
      description:
        'ข้าพเจ้าขอรับรองว่าข้อความข้างต้นเป็นความจริง ซึ่งข้าพเจ้ามีสภาพร่างกายสมบูรณ์พร้อม และสามารถลงแข่งขันในประเภทที่ลงสมัคร และจะปฏิบัติตามกฎกติกาทุกประการโดยไม่เรียกร้องค่าเสียหายใดๆ หากเกิดอันตราย หรือบาดเจ็บ ทั้งก่อน และระหว่างแข่งขัน อีกทั้งยินดีแสดงหลักฐานพิสูจน์ตนเองต่อผู้จัด และยินยอมให้ผู้จัดถ่ายภาพเคลื่อนไหว เพื่อบันทึกการแข่งขัน และถือเป็นลิขสิทธิ์ของผู้จัด ในกรณีกิจกรรมนี้ต้องยกเลิกทั้งหมด หรือส่วนใดส่วนหนึ่ง โดยสืบเนื่องจากสาเหตุสุดวิสัยใดๆ ทางธรรมชาติ หรือภาวะอื่นใดก็ตาม',
    },
    {
      id: '2',
      description:
        'ข้าพเจ้าทราบ และยินยอมว่าจะไม่มีการคืนเงินค่าสมัครให้แก่ข้าพเจ้า',
    },
  ],
  state: 'pre_register',
  rules1: [
    {
      id: '1',
      title: 'กติกาของงานซึ่งผู้สมัครเข้าร่วมการแข่งขันต้องยอมรับและปฏิบัติตาม',
    },
    {
      id: '2',
      title: '1. กติกาของงานสอดคล้องกับกฎหมาย',
    },
    {
      id: '3',
      title:
        '2. นอกจากกติกาของงานแล้ว ยังประกอบด้วยกติกาการแข่งขัน และกติกาในการสมัคร',
    },
    {
      id: '4',
      title:
        '3. นักวิ่งผู้เข้าร่วมจะถูกปฏิบัติตามข้อควรระวังของผู้จัดงานเพื่อให้แน่ใจว่าผู้เข้าร่วมเกิดความปลอดภัย และผู้เข้าร่วมจะทำการวิ่งโดยยอมรับความเสี่ยงของตนเอง และผู้จัดงานจะไม่รับผิดชอบหรือต้องระวางโทษต่อการบาดเจ็บหรือเสียชีวิต ไม่ว่ากรณีฝึกซ้อมหรือระหว่างเข้าร่วมแข่งขัน ทั้งนี้ ผู้เข้าร่วมควรพบแพทย์หรือที่ปรึกษาทางสุขภาพก่อนทำการลงทะเบียน และก่อนวันแข่งขันจริง',
    },
    {
      id: '5',
      title:
        '4. ผู้จัดไม่รับผิดชอบในความเสียหายที่เกิดจากสิ่งต่อไปนี้: o (ก) ความเจ็บป่วยหรืออุบัติเหตุ (ผู้จัดจะจัดเตรียมแพทย์ พยาบาล อาสาสมัคร และเจ้าหน้าที่เพื่อช่วยเหลือในกรณีฉุกเฉิน และมีการทำประกันภัยให้แก่นักวิ่งที่เข้าร่วมทุกคน) o (ข) การสูญหายหรือเสียหายของทรัพย์สินส่วนบุคคล o (ค) การล่าช้าของการแข่งขันที่เกิดจากสิ่งที่ผู้จัดควบคุมไม่ได้',
    },
  ],
};

const generateActivity = async () => {
  try {
    const newActivity = await ActivityService.createActivity(data);
    const partner = await PartnerService.findById('5fd84c8e56222a54d0de180f');

    let activities;
    if (partner.activities) {
      activities = [...partner.activities, newActivity.id];
    } else {
      activities = [...newActivity.id];
    }
    await PartnerService.editPartner('5fd84c8e56222a54d0de180f', {
      activities,
    });
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

generateActivity();

// const createManyActivities = async () => {
//   for (let index = 0; index <= 100; index++) {
//     await generateActivity(index);
//   }
//   process.exit(0);
// };

// createManyActivities();
