const { OnboardingService } = require('../services');

const generateOnboarding = async (data) => {
  await OnboardingService.createOnboarding({
    title: data.title,
    subtitle_th: data.subtitle_th,
    description_th: data.description_th,
    subtitle_en: data.subtitle_en,
    description_en: data.description_en,
    color: data.color,
    picture: data.picture,
  });
};

const slides = [
  {
    title: 'Runner',
    subtitle_th: 'ประสบการณ์ใหม่',
    description_th: 'ค้นหากิจกรรมวิ่งครั้งแรกของคุณกับคอมมิวนิตี้ของเรา',
    subtitle_en: 'New Experiences',
    description_en: 'Find your first activity with our community',
    color: '#b72065',
    picture: 'http://clipart-library.com/image_gallery2/Fashion.png',
  },
  {
    title: 'Relationship',
    subtitle_th: 'ค้นพบเพื่อนใหม่',
    description_th: 'ค้นหาเพื่อนใหม่กับสังคมใหม่แห่งการแชร์ของเรา',
    subtitle_en: 'Discover new companies',
    description_en: 'Find new friends with our sharing community',
    color: '#7d0281',
    picture:
      'http://clipart-library.com/image_gallery2/Fashion-Transparent.png',
  },
  {
    title: 'New way',
    subtitle_th: 'การดำเนินการที่ดีกว่า',
    description_th: 'สะดวกสบายมากขึ้นกับระบบการลงทะเบียน เช็คอิน และเช็คเอ้าท์',
    subtitle_en: 'Better processes',
    description_en:
      'More convinient with our registering, checking in and chekcing out processes',
    color: '#b91e66',
    picture:
      'http://clipart-library.com/image_gallery2/Fashion-Free-Download-PNG.png',
  },
  {
    title: 'Simply',
    subtitle_th: 'ออกเดินทางไปกับเพื่อนของคุณ',
    description_th: 'หาเพื่อนร่วมเดินทางท่องเที่ยว ก่อนกิจกรรมของคุณจะเริ่ม',
    subtitle_en: 'Get along with new friends',
    description_en:
      'Find new companies and get along on the trip before your marathon',
    color: '#8a1776',
    picture:
      'http://clipart-library.com/images_k/fashion-girl-silhouette/fashion-girl-silhouette-8.png',
  },
];

const getAll = async () => {
  slides.map(async (item) => {
    await generateOnboarding(item);
  });
};

getAll();
