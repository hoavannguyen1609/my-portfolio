import type { FC } from 'react';

import { type Container, type ISourceOptions, MoveDirection, OutMode } from '@tsparticles/engine';
import { initParticlesEngine } from '@tsparticles/react';
import { clsx } from 'clsx';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
// import { loadAll } from "@tsparticles/all"; // if you are going to use `loadAll`, install the "@tsparticles/all" package too.
// import { loadFull } from "tsparticles"; // if you are going to use `loadFull`, install the "tsparticles" package too.
import { loadSlim } from '@tsparticles/slim'; // if you are going to use `loadSlim`, install the "@tsparticles/slim" package too.
// import { loadBasic } from "@tsparticles/basic"; // if you are going to use `loadBasic`, install the "@tsparticles/basic" package too.

import { faComments, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import educationList from '@/assets/jsons/education-list.json';
import technicalSkills from '@/assets/jsons/technical-skill.json';

import cssModuleClasses from './Home.module.scss';
import { TechnicalSkillsRatingStar } from './TechnicalSkillsRatingStar';

const Home: FC = () => {
  const { t } = useTranslation();

  const [init, setInit] = useState(false);

  // this should be run only once per application lifetime
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      // you can initiate the tsParticles instance (engine) here, adding custom shapes or presets
      // this loads the tsparticles package bundle, it's the easiest method for getting everything ready
      // starting from v2 you can add only the features you need reducing the bundle size
      //await loadAll(engine);
      //await loadFull(engine);
      await loadSlim(engine);
      //await loadBasic(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = async (container?: Container): Promise<void> => {
    console.log(container);
  };

  const options: ISourceOptions = useMemo(
    () => ({
      // background: {
      //   color: {
      //     value: COLOR_PRIMARY,
      //   },
      // },
      fpsLimit: 120,
      interactivity: {
        detectsOn: 'canvas',
        events: {
          onClick: {
            enable: true,
            mode: 'push',
          },
          onHover: {
            enable: true,
            mode: 'grab',
          },
        },
        modes: {
          grab: {
            distance: 140,
            quantity: 4,
            lineLinked: {
              opacity: 1,
            },
          },
          bubble: {
            distance: 400,
            size: 40,
            duration: 2,
            opacity: 8,
            speed: 3,
          },
          repulse: {
            distance: 200,
            duration: 0.4,
          },
          push: {
            particlesNb: 4,
          },
          remove: {
            particlesNb: 2,
          },
        },
      },
      particles: {
        color: {
          value: '#ffffff',
        },
        links: {
          color: '#ffffff',
          distance: 150,
          enable: true,
          opacity: 0.5,
          width: 1,
        },
        move: {
          direction: MoveDirection.none,
          enable: true,
          outModes: {
            default: OutMode.out,
          },
          random: false,
          speed: 6,
          straight: false,
          bounce: false,
          attract: {
            enable: false,
            rotateX: 600,
            rotateY: 1200,
          },
        },
        number: {
          density: {
            enable: true,
            valueArea: 800,
          },
          value: 80,
        },
        opacity: {
          value: 0.5,
          random: false,
          anim: {
            enable: false,
            speed: 1,
            opacityMin: 0.1,
            sync: false,
          },
        },
        shape: {
          type: 'circle',
          stroke: {
            width: 0,
            color: '#000000',
          },
          polygon: {
            nb_sides: 5,
          },
          image: {
            src: 'img/github.svg',
            width: 100,
            height: 100,
          },
        },
        size: {
          value: 3,
          random: true,
          anim: {
            enable: false,
            speed: 40,
            sizeMin: 0.1,
            sync: false,
          },
        },
      },
      detectRetina: true,
    }),
    [],
  );

  return (
    <main>
      {/* Hero Section */}
      <section
        className={clsx(
          'text-white py-24 md:py-40 text-center relative z-10 overflow-hidden',
          cssModuleClasses['hero-section'],
          cssModuleClasses['reveal'],
        )}
        id="hero"
      >
        {/* {init && (
          <Particles
            id="tsparticles"
            className={clsx('w-full h-full absolute', cssModuleClasses['particles'])}
            particlesLoaded={particlesLoaded}
            options={options}
          />
        )} */}
        {/* Particles.js container */}
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-center md:space-x-16">
            {/* Avatar */}
            <div className="mb-10 md:mb-0 transform hover:scale-105 transition-transform duration-500">
              <img
                src="/images/25c92c7dcbe2b7f083afc19457d07fd9_2-removebg-preview.png"
                alt="Avatar NGUYEN VAN HOA"
                className="rounded-full border-6 border-white shadow-2xl w-52 object-cover mx-auto animate-pulse-light max-w-full h-auto"
              />
            </div>
            <div className="md:w-1/2">
              <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-4 animate-fade-in-up sm:text-4xl">
                {t('fullName', 'NGUYEN VAN HOA')}
              </h1>
              <p className="text-xl md:text-2xl font-light animate-fade-in-up delay-200 sm:text-lg min-h-[56px] md:min-h-[32px]">
                <span id="typing-text" className="font-medium" />
              </p>
              <div className="mt-8 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6 animate-fade-in-up delay-400">
                <a
                  href="https://zalo.me/+84941470529"
                  target="_blank"
                  className={clsx('flex items-center justify-center', cssModuleClasses['btn-secondary'])}
                >
                  <FontAwesomeIcon icon={faComments} className="mr-2" />
                  <span>{t('zaloChat', 'Chat Zalo')}</span>
                </a>
                <a
                  href="#contact"
                  className={clsx('flex items-center justify-center', cssModuleClasses['btn-primary'])}
                >
                  <FontAwesomeIcon icon={faEnvelope} />
                  <span>{t('contactNow', 'Liên hệ ngay')}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* About Me Section */}
      <section id="about" className="py-16 md:py-24 bg-white reveal">
        <div className="container mx-auto px-6 max-w-5xl">
          <h2
            className="text-4xl font-bold text-gray-900 mb-10 section-heading text-center md:text-left"
            data-key="aboutMeTitle"
          >
            Về tôi
          </h2>
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-lg leading-relaxed mb-6 text-gray-700 sm:text-base" data-key="aboutMeText1">
                Chào bạn, tôi là **NGUYEN VAN HOA**, một **Full-stack Developer** với niềm đam mê xây dựng các ứng dụng
                web hiệu suất cao, bảo mật và có khả năng mở rộng. Với kinh nghiệm làm việc trong nhiều dự án đa dạng,
                tôi tự tin về kỹ năng thiết kế kiến trúc, phát triển và tối ưu hóa hiệu suất ứng dụng từ frontend đến
                backend.
              </p>
              <p className="text-lg leading-relaxed text-gray-700 sm:text-base" data-key="aboutMeText2">
                Tôi là một thành viên đội nhóm tận tâm, luôn sẵn sàng học hỏi, hợp tác và hướng tới mục tiêu chung. Tôi
                tin rằng sự kết hợp giữa kỹ năng kỹ thuật vững chắc và tinh thần giải quyết vấn đề sẽ giúp tôi đóng góp
                vào sự thành công của mọi dự án.
              </p>
            </div>
            <div className="bg-gray-50 p-8 rounded-xl shadow-md border border-gray-100 sm:p-6">
              <h3 className="text-2xl font-semibold text-gray-800 mb-5 flex items-center sm:text-xl">
                <i className="fas fa-info-circle mr-3 text-blue-600" />
                <span data-key="contactInfoTitle">Thông tin liên hệ</span>
              </h3>
              <ul className="text-lg leading-relaxed space-y-4 text-gray-700 sm:text-base sm:space-y-3">
                <li className="flex items-center">
                  <i className="fa-solid fa-cake-candles mr-3 text-purple-500" />
                  <span className="text-blue-600" data-key="birthday" />
                </li>
                <li className="flex items-center">
                  <i className="fas fa-phone-alt mr-3 text-purple-500" style={{ transform: 'rotate(90deg)' }} />
                  <a className="text-blue-600 hover:underline" href="tel:+84876160901" data-key="phone">
                    +84876160901
                  </a>
                </li>
                <li className="flex items-center">
                  <i className="fas fa-envelope mr-3 text-purple-500" />
                  <a
                    className="text-blue-600 hover:underline"
                    href="mailto:hoavannguyen1609@gmail.com"
                    data-key="email"
                  >
                    hoavannguyen1609@gmail.com
                  </a>
                </li>
                <li className="flex items-center">
                  <i className="fas fa-map-marker-alt mr-3 text-purple-500" />
                  <a
                    href="https://maps.app.goo.gl/C5LgxA1A9v5GsRiy5"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                    data-key="address"
                  >
                    Trung Hoa, Cầu Giấy, Hà Nội
                  </a>
                </li>
                <li className="flex items-center">
                  <i className="fa-solid fa-comments mr-3 text-purple-500" />
                  <a
                    href="https://zalo.me/+84941470529"
                    target="_blank"
                    className="text-blue-600 hover:underline"
                    data-key="zaloLink"
                    rel="noopener noreferrer"
                  >
                    https://zalo.me/+84941470529
                  </a>
                </li>
                <li className="flex items-center">
                  <i className="fa-solid fa-c mr-3 text-purple-500" />
                  <a
                    href="https://www.canva.com/design/DAGQWMp6X5A/qvXBKMGcsHpvA_VZhiwS4w/edit?utm_content=DAGQWMp6X5A&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton"
                    target="_blank"
                    className="text-blue-600 hover:underline"
                    data-key="curriculumVitae"
                    rel="noopener noreferrer"
                  >
                    Sơ yếu lý lịch
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      {/* Skills Section */}
      <section id="skills" className="py-16 md:py-24 bg-gray-100 reveal">
        <div className="container mx-auto px-6 max-w-5xl">
          <h2
            className="text-4xl font-bold text-gray-900 mb-10 section-heading text-center md:text-left"
            data-key="skillsTitle"
          >
            Kỹ năng
          </h2>
          <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 mb-10 sm:p-6 sm:mb-8">
            <h3 className="text-2xl font-semibold text-gray-800 mb-5 flex items-center sm:text-xl">
              <i className="fas fa-code mr-3 text-green-600" />
              <span data-key="techSkillsTitle">Kỹ năng kỹ thuật</span>
            </h3>
            <div className="flex flex-wrap -m-1">
              {technicalSkills.map((itemSkill, indexSkill) => (
                <div
                  key={itemSkill.name + indexSkill}
                  className={clsx('inline-flex items-center font-semibold relative', cssModuleClasses[''])}
                >
                  <FontAwesomeIcon icon={itemSkill.icon} />
                  <span>{itemSkill.name}</span>
                  <div className={clsx('', cssModuleClasses['skill-rating-tooltip'])}>
                    <span className="text-yellow-400">
                      <TechnicalSkillsRatingStar numberRate={itemSkill.rating} />
                    </span>
                    <span className="ml-2 text-gray-300">{itemSkill.rating}/5</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 sm:p-6">
            <h3 className="text-2xl font-semibold text-gray-800 mb-5 flex items-center sm:text-xl">
              <i className="fas fa-users-cog mr-3 text-indigo-600" />
              <span data-key="softSkillsTitle">Kỹ năng mềm</span>
            </h3>
            <div className="flex flex-wrap -m-1" id="soft-skills" />
          </div>
        </div>
      </section>
      {/* Education Section */}
      <section id="education" className="py-16 md:py-24 bg-gray-100 reveal">
        <div className="container mx-auto px-6 max-w-5xl">
          <h2
            className="text-4xl font-bold text-gray-900 mb-10 section-heading text-center md:text-left"
            data-key="educationTitle"
          >
            Học vấn
          </h2>
          {educationList.map((item) => (
            <div key={item.name} className="education-card mb-8 p-8 bg-white border border-gray-100 sm:p-6 sm:mb-6">
              <div className="flex items-center justify-between mb-3 sm:flex-row flex-col sm:items-start">
                <div className="flex items-center w-full sm:w-auto mb-2 sm:mb-0">
                  <img src={item.image} alt="PTIT Logo" className="education-logo" />
                  <h3 className="font-bold text-gray-800 sm:text-xl text-2xl">{t(item.name)}</h3>
                </div>
                <span className="text-sm text-gray-500 bg-gray-200 px-3 py-1 rounded-full mt-2 sm:mt-0">
                  {t(item.rangeDate)}
                </span>
              </div>
              <p className="text-blue-700 font-semibold mb-2 sm:text-lg text-xl" data-key="eduPTITMajor">
                {t(item.major)}
              </p>
              {item.description.map((itemDesc, index) => (
                <p
                  key={itemDesc + index}
                  className="leading-relaxed text-gray-700 sm:text-base text-lg"
                  data-key="eduPTITForm"
                >
                  {t(itemDesc)}
                </p>
              ))}
            </div>
          ))}
        </div>
      </section>
      {/* Work Experience Section */}
      <section id="experience" className="py-16 bg-white reveal md:py-24">
        <div className="container mx-auto px-6 max-w-5xl">
          <h2 className="text-gray-900 mb-10 section-heading text-center md:text-left" data-key="experienceTitle">
            Kinh nghiệm làm việc
          </h2>
          {/* 84Soft Technology and Investment Joint Stock Company */}
          <div className="experience-card mb-8 p-8 bg-gray-50 border border-gray-100 sm:p-6 sm:mb-6">
            <div className="flex items-center justify-between mb-3 sm:flex-row sm:items-center flex-col sm:items-start">
              <div className="flex items-center w-full sm:w-auto mb-2 sm:mb-0">
                <img src="/images/logo84Soft.png" alt="84Soft Logo" className="company-logo" />
                <h3 className="font-bold text-gray-800 sm:text-xl text-2xl" data-key="exp84SoftName">
                  Công ty Cổ phần Công nghệ và Đầu tư 84Soft
                </h3>
              </div>
              <span
                className="text-sm text-gray-500 bg-gray-200 px-3 py-1 rounded-full mt-2 sm:mt-0"
                data-key="exp84SoftDates"
              >
                03/2022 - 05/2025
              </span>
            </div>
            <p className="text-blue-700 font-semibold mb-4 sm:text-lg text-xl" data-key="exp84SoftRole">
              Full-Stack Developer / Frontend Team Lead
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 pl-4 sm:text-base sm:space-y-1 text-lg">
              <li data-key="exp84SoftResp1">Phân tích, phát triển và duy trì các ứng dụng web phức tạp.</li>
              <li data-key="exp84SoftResp2">Chủ động tham gia phát triển dự án backend, đảm bảo tích hợp liền mạch.</li>
              <li data-key="exp84SoftResp3">
                Dẫn dắt đội ngũ Frontend, quản lý và phân công công việc, tối ưu hóa quy trình.
              </li>
              <li data-key="exp84SoftResp4">Đề xuất giải pháp kỹ thuật sáng tạo cho các tính năng dự án mới.</li>
              <li data-key="exp84SoftResp5">Cải thiện hiệu suất ứng dụng và xử lý các vấn đề kỹ thuật.</li>
            </ul>
          </div>
          {/* International Information Technology Solutions Joint Stock Company */}
          <div className="experience-card p-8 bg-gray-50 border border-gray-100 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:flex-row sm:items-center flex-col sm:items-start">
              <div className="flex items-center w-full sm:w-auto mb-2 sm:mb-0">
                <img src="/images/logoInterITS.png" alt="International ITS Logo" className="company-logo" />
                <h3 className="font-bold text-gray-800 sm:text-xl text-2xl" data-key="expInterITSName">
                  Công ty Cổ phần Giải pháp Công nghệ thông tin quốc tế
                </h3>
              </div>
              <span
                className="text-sm text-gray-500 bg-gray-200 px-3 py-1 rounded-full mt-2 sm:mt-0"
                data-key="expInterITSDates"
              >
                07/2024 - 09/2024
              </span>
            </div>
            <p className="text-blue-700 font-semibold mb-4 sm:text-lg text-xl" data-key="expInterITSRole">
              Onsite - Frontend Developer
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 pl-4 sm:text-base sm:space-y-1 text-lg">
              <li data-key="expInterITSResp1">
                Phát triển các ứng dụng web với giao diện người dùng thân thiện và hiệu quả.
              </li>
              <li data-key="expInterITSResp2">
                Hợp tác chặt chẽ với đội ngũ backend để đảm bảo tích hợp API chính xác.
              </li>
            </ul>
          </div>
        </div>
      </section>
      {/* Projects Section */}
      <section id="projects" className="py-16 md:py-24 bg-white reveal">
        <div className="container mx-auto px-6 max-w-5xl">
          <h2
            className="text-4xl font-bold text-gray-900 mb-10 section-heading text-center md:text-left"
            data-key="projectsTitle"
          >
            Dự án nổi bật
          </h2>
          <div id="project-list" className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 sm:grid-cols-1" />
        </div>
      </section>
      {/* Contact Section */}
      <section id="contact" className="py-16 md:py-24 bg-gradient-to-r from-blue-600 to-purple-700 text-white reveal">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h2
            className="text-4xl font-bold mb-8 section-heading-light mx-auto sm:text-2xl"
            data-key="contactSectionTitle"
          >
            Liên hệ
          </h2>
          <p className="text-xl leading-relaxed mb-10 opacity-90 sm:text-lg" data-key="contactSectionText">
            Bạn có một dự án thú vị cần phát triển? Hoặc muốn trao đổi thêm về cơ hội nghề nghiệp? Đừng ngần ngại liên
            hệ với tôi qua các kênh dưới đây!
          </p>
          <div className="flex flex-col md:flex-row justify-center items-center space-y-6 md:space-y-0 md:space-x-10">
            <a
              href="mailto:hoavannguyen1609@gmail.com"
              className="btn-secondary-light flex items-center group justify-center w-full md:w-auto"
            >
              <i className="fas fa-envelope mr-3 text-white group-hover:text-blue-500 transition duration-300" />
              <span className="text-white group-hover:text-blue-500 transition duration-300" data-key="sendEmail">
                Gửi Email
              </span>
            </a>
            <a
              href="tel:+84876160901"
              className="btn-secondary-light flex items-center group justify-center w-full md:w-auto"
            >
              <i
                className="fas fa-phone-alt mr-3 text-white group-hover:text-blue-500 transition duration-300"
                style={{ transform: 'rotate(90deg)' }}
              />
              <span className="text-white group-hover:text-blue-500 transition duration-300" data-key="callMe">
                Gọi điện
              </span>
            </a>
            <a
              href="https://zalo.me/+84941470529"
              target="_blank"
              className="btn-secondary-light flex items-center group justify-center w-full md:w-auto"
            >
              <i className="fa-solid fa-comments mr-3 text-white group-hover:text-blue-500 transition duration-300" />
              <span className="text-white group-hover:text-blue-500 transition duration-300" data-key="chatZalo">
                Chat Zalo
              </span>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
