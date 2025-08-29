import type { EffectCallback, FC } from 'react';

import { MoveDirection, OutMode, type Container, type ISourceOptions } from '@tsparticles/engine';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { clsx } from 'clsx';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
// import { loadAll } from "@tsparticles/all"; // if you are going to use `loadAll`, install the "@tsparticles/all" package too.
// import { loadFull } from "tsparticles"; // if you are going to use `loadFull`, install the "tsparticles" package too.
import { loadSlim } from '@tsparticles/slim'; // if you are going to use `loadSlim`, install the "@tsparticles/slim" package too.
// import { loadBasic } from "@tsparticles/basic"; // if you are going to use `loadBasic`, install the "@tsparticles/basic" package too.
import { library, type IconProp } from '@fortawesome/fontawesome-svg-core';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons'; // Thêm để có các icon sao rỗng
import {
  faC,
  faCakeCandles,
  faCode,
  faComments,
  faEnvelope,
  faInfoCircle,
  faMapMarkerAlt,
  faPhoneAlt,
  fas,
  faUsersCog,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { TechnicalSkillsRatingStar } from './TechnicalSkillsRatingStar';

import educationList from '@/assets/jsons/education-list.json';
import projectList from '@/assets/jsons/project-list.json';
import softSkills from '@/assets/jsons/soft-skill.json';
import technicalSkills from '@/assets/jsons/technical-skill.json';
import workExperiences from '@/assets/jsons/work-experience.json';

import cssModuleClasses from './Home.module.scss';

library.add(fas, fab, far);

const Home: FC = () => {
  const { t } = useTranslation();

  const [init, setInit] = useState(false);
  const typingTextElement = useRef<HTMLSpanElement | null>(null);
  const isDeleting = useRef<boolean>(false);
  const charIndex = useRef<number>(0);
  const textIndex = useRef<number>(0);
  const timerId = useRef<ReturnType<typeof setTimeout>>(null);

  const handleIntersectionRevealElements = (): void => {
    const revealElements = document.querySelectorAll(`.${cssModuleClasses['reveal']}`);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const heading = entry.target.querySelector(`.${cssModuleClasses['section-heading']}`);

          if (entry.isIntersecting) {
            entry.target.classList.add(cssModuleClasses['active']);
            if (heading) {
              heading.classList.add(cssModuleClasses['active']);
            }
          } else {
            entry.target.classList.remove(cssModuleClasses['active']);
            if (heading) {
              heading.classList.remove(cssModuleClasses['active']);
            }
          }
        });
      },
      { threshold: 0.15 },
    );
    revealElements.forEach((el) => observer.observe(el));
  };

  function handleTypeWriter() {
    if (typingTextElement.current) {
      const typingTextsArray = t('typingTexts', { returnObjects: true }) as string[];

      if (typingTextElement.current.dataset.started !== 'true') return; // Only run if initiated by observer and not paused
      const currentText = typingTextsArray[textIndex.current];
      if (isDeleting.current) {
        typingTextElement.current.textContent = currentText.substring(0, charIndex.current - 1);
        charIndex.current--;
      } else {
        typingTextElement.current.textContent = currentText.substring(0, charIndex.current + 1);
        charIndex.current++;
      }

      if (!isDeleting.current && charIndex.current === currentText.length) {
        timerId.current = setTimeout(() => (isDeleting.current = true), 2000);
      } else if (isDeleting.current && charIndex.current === 0) {
        isDeleting.current = false;
        textIndex.current = (textIndex.current + 1) % typingTextsArray.length;
        timerId.current = setTimeout(() => handleTypeWriter(), 700);
        return;
      }

      const typingSpeed = isDeleting ? 70 : 120;
      timerId.current = setTimeout(handleTypeWriter, typingSpeed);
    }
  }

  const handleIntersectionHeroSection = (): void => {
    if (typingTextElement.current) {
      // Start typing effect when the hero section is active
      const heroObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (typingTextElement.current) {
              if (entry.isIntersecting && typingTextElement.current.dataset.started !== 'true') {
                typingTextElement.current.dataset.started = 'true';
                handleTypeWriter();
              } else if (!entry.isIntersecting && typingTextElement.current.dataset.started === 'true') {
                // Optional: You could pause/reset typing when out of view if desired
                // For now, let's keep it running in the background if it started once
              }
            }
          });
        },
        { threshold: 0.5 },
      );

      const heroSection: HTMLDivElement | null = document.querySelector(`.${cssModuleClasses['hero-section']}`);

      if (heroSection) {
        heroObserver.observe(heroSection);
      }
    }
  };

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

  useEffect((): void => {
    handleTypeWriter();
    handleIntersectionRevealElements();
    handleIntersectionHeroSection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // this should be run only once per application lifetime
  useEffect((): ReturnType<EffectCallback> => {
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

    return () => {
      if (typeof timerId.current === 'number') {
        clearTimeout(timerId.current);
      }
    };
  }, []);

  return (
    <main>
      {/* Hero Section */}
      <section
        className={clsx(
          'text-white py-24 md:py-40 text-center relative z-10 overflow-hidden',
          cssModuleClasses['hero-section'],
          cssModuleClasses['reveal'],
        )}
      >
        {init && (
          <Particles
            id="tsparticles"
            className={clsx('w-full h-full absolute', cssModuleClasses['particles'])}
            particlesLoaded={particlesLoaded}
            options={options}
          />
        )}
        {/* Particles.js container */}
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-center md:space-x-16">
            {/* Avatar */}
            <div className="mb-10 md:mb-0 transform hover:scale-105 transition-transform duration-500">
              <img
                src="./images/25c92c7dcbe2b7f083afc19457d07fd9_2-removebg-preview.png"
                alt="Avatar NGUYEN VAN HOA"
                className="rounded-full border-6 border-white shadow-2xl w-52 object-cover mx-auto animate-pulse-light max-w-full h-auto"
              />
            </div>
            <div className="md:w-1/2">
              <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-4 animate-fade-in-up sm:text-4xl">
                {t('fullName', 'NGUYEN VAN HOA')}
              </h1>
              <p className="text-xl md:text-2xl font-light animate-fade-in-up delay-200 sm:text-lg min-h-[56px] md:min-h-[32px]">
                <span ref={typingTextElement} className="font-medium" />
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
      <section
        id="about"
        className={clsx('py-16 md:py-24 bg-white', cssModuleClasses['reveal'], cssModuleClasses['about'])}
      >
        <div className="container mx-auto px-6 max-w-5xl">
          <h2
            className={clsx(
              'text-4xl font-bold text-gray-900 mb-10 text-center md:text-left',
              cssModuleClasses['section-heading'],
            )}
          >
            {t('aboutMeTitle')}
          </h2>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 items-center">
            <div>
              <p
                className="text-lg leading-relaxed mb-6 text-gray-700 sm:text-base"
                dangerouslySetInnerHTML={{ __html: t('aboutMeText1') }}
              ></p>
              <p
                className="text-lg leading-relaxed text-gray-700 sm:text-base"
                dangerouslySetInnerHTML={{ __html: t('aboutMeText2') }}
              ></p>
            </div>
            <div className="bg-gray-50 p-8 rounded-xl shadow-md border border-gray-100 sm:p-6">
              <h3 className="text-2xl font-semibold text-gray-800 mb-5 flex items-center sm:text-xl">
                <FontAwesomeIcon icon={faInfoCircle} className="mr-3 text-blue-600" />
                <span>{t('contactInfoTitle')}</span>
              </h3>
              <ul className="text-lg leading-relaxed space-y-4 text-gray-700 sm:text-base sm:space-y-3">
                <li className="flex items-center">
                  <FontAwesomeIcon icon={faCakeCandles} className="mr-3 text-purple-500" />
                  <span className="text-blue-600">{t('birthday')}</span>
                </li>
                <li className="flex items-center">
                  <FontAwesomeIcon icon={faPhoneAlt} className="mr-3 text-purple-500" />
                  <a className="text-blue-600 hover:underline" href={'tel:' + t('phone')}>
                    {t('phone')}
                  </a>
                </li>
                <li className="flex items-center">
                  <FontAwesomeIcon icon={faEnvelope} className="mr-3 text-purple-500" />
                  <a className="text-blue-600 hover:underline" href={'mailto:' + t('email')}>
                    {t('email')}
                  </a>
                </li>
                <li className="flex items-center">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-3 text-purple-500" />
                  <a
                    href="https://maps.app.goo.gl/C5LgxA1A9v5GsRiy5"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {t('address')}
                  </a>
                </li>
                <li className="flex items-center">
                  <FontAwesomeIcon icon={faComments} className="mr-3 text-purple-500" />
                  <a
                    href={t('zaloLink')}
                    target="_blank"
                    className="text-blue-600 hover:underline"
                    rel="noopener noreferrer"
                  >
                    {t('zaloLink')}
                  </a>
                </li>
                <li className="flex items-center">
                  <FontAwesomeIcon icon={faC} className="mr-3 text-purple-500" />
                  <a
                    href="https://www.canva.com/design/DAGQWMp6X5A/qvXBKMGcsHpvA_VZhiwS4w/edit?utm_content=DAGQWMp6X5A&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton"
                    target="_blank"
                    className="text-blue-600 hover:underline"
                    rel="noopener noreferrer"
                  >
                    {t('curriculumVitae')}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      {/* Skills Section */}
      <section id="skills" className={clsx('py-16 md:py-24 bg-gray-100', cssModuleClasses['reveal'])}>
        <div className="container mx-auto px-6 max-w-5xl">
          <h2
            className={clsx(
              'text-4xl font-bold text-gray-900 mb-10 text-center md:text-left',
              cssModuleClasses['section-heading'],
            )}
          >
            {t('skillsTitle')}
          </h2>
          <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 mb-10 sm:p-6 sm:mb-8">
            <h3 className="text-2xl font-semibold text-gray-800 mb-5 flex items-center sm:text-xl">
              <FontAwesomeIcon icon={faCode} className="mr-3 text-green-600" />
              <span>{t('techSkillsTitle')}</span>
            </h3>
            <div className="flex flex-wrap -m-1">
              {technicalSkills.map((itemSkill, indexSkill) => (
                <div
                  key={itemSkill.name + indexSkill}
                  className={clsx(
                    'inline-flex items-center font-semibold relative py-2 px-4 gap-x-2',
                    cssModuleClasses['skill-badge'],
                  )}
                >
                  <FontAwesomeIcon icon={itemSkill.icon as IconProp} />
                  <span>{itemSkill.name}</span>
                  <div
                    className={clsx(
                      'absolute bottom-full left-1/2 text-white py-2 px-3 rounded-lg whitespace-nowrap font-medium opacity-0 flex items-center pointer-events-none',
                      cssModuleClasses['skill-rating-tooltip'],
                    )}
                  >
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
              <FontAwesomeIcon icon={faUsersCog} className="mr-3 text-indigo-600" />
              <span>{t('softSkillsTitle')}</span>
            </h3>
            <div className="flex flex-wrap -m-1">
              {softSkills.map((itemSkill, indexSkill) => (
                <div
                  key={itemSkill.key + indexSkill}
                  className={clsx(
                    'inline-flex items-center font-semibold relative py-2 px-4 gap-x-2',
                    cssModuleClasses['skill-badge'],
                  )}
                >
                  <FontAwesomeIcon icon={itemSkill.icon as IconProp} />
                  <span>{t(itemSkill.key)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* Education Section */}
      <section id="education" className={clsx('py-16 md:py-24 bg-gray-100', cssModuleClasses['reveal'])}>
        <div className="container mx-auto px-6 max-w-5xl">
          <h2
            className={clsx(
              'text-4xl font-bold text-gray-900 mb-10 text-center md:text-left',
              cssModuleClasses['section-heading'],
            )}
          >
            {t('educationTitle')}
          </h2>
          {educationList.map((item) => (
            <div key={item.name} className="education-card mb-8 p-8 bg-white border border-gray-100 sm:p-6 sm:mb-6">
              <div className="flex items-center justify-between mb-3 sm:flex-row flex-col sm:items-start">
                <div className="flex items-center w-full sm:w-auto mb-2 sm:mb-0">
                  <img
                    src={item.image}
                    alt={t(item.name) + ' logo'}
                    className="w-8 h-8 md:w-10 md:h-10 object-contain mr-2 md:mr-3 rounded-lg overflow-hidden"
                  />
                  <h3 className="font-bold text-gray-800 sm:text-xl text-2xl">{t(item.name)}</h3>
                </div>
                <span className="text-sm text-gray-500 bg-gray-200 px-3 py-1 rounded-full mt-2 sm:mt-0">
                  {t(item.rangeDate)}
                </span>
              </div>
              <p className="text-blue-700 font-semibold mb-2 sm:text-lg text-xl">{t(item.major)}</p>
              {item.description.map((itemDesc, index) => (
                <p key={itemDesc + index} className="leading-relaxed text-gray-700 sm:text-base text-lg">
                  {t(itemDesc)}
                </p>
              ))}
            </div>
          ))}
        </div>
      </section>
      {/* Work Experience Section */}
      <section id="experience" className={clsx('py-16 bg-white md:py-24', cssModuleClasses['reveal'])}>
        <div className="container mx-auto px-6 max-w-5xl">
          <h2 className={clsx('text-gray-900 mb-10 text-center md:text-left', cssModuleClasses['section-heading'])}>
            {t('experienceTitle')}
          </h2>
          {workExperiences.map((itemWork) => (
            <div
              key={itemWork.name}
              className={clsx(
                'mb-8 p-8 bg-gray-50 border border-gray-100 sm:p-6 sm:mb-6',
                cssModuleClasses['experience-card'],
              )}
            >
              <div className="flex items-center justify-between mb-3 sm:flex-row flex-col sm:items-start">
                <div className="flex items-center w-full sm:w-auto mb-2 sm:mb-0">
                  <img
                    src={itemWork.image}
                    alt={t(itemWork.name) + ' Logo'}
                    className="w-8 h-8 md:w-10 md:h-10 object-contain mr-2 md:mr-3 rounded-lg overflow-hidden"
                  />
                  <h3 className="font-bold text-gray-800 sm:text-xl text-2xl">{t(itemWork.name)}</h3>
                </div>
                <span className="text-sm text-gray-500 bg-gray-200 px-3 py-1 rounded-full mt-2 sm:mt-0">
                  {t(itemWork.rangeDate)}
                </span>
              </div>
              <p className="text-blue-700 font-semibold mb-4 sm:text-lg text-xl">{t(itemWork.role)}</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 pl-4 sm:text-base sm:space-y-1 text-lg">
                {itemWork.responsibility.map((responsibility) => (
                  <li key={responsibility}>{t(responsibility)}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
      {/* Projects Section */}
      <section id="projects" className={clsx('py-16 md:py-24 bg-white', cssModuleClasses['reveal'])}>
        <div className="container mx-auto px-6 max-w-5xl">
          <h2
            className={clsx(
              'text-4xl font-bold text-gray-900 mb-10 text-center md:text-left',
              cssModuleClasses['section-heading'],
            )}
          >
            {t('projectsTitle')}
          </h2>
          <div id="project-list" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:grid-cols-1">
            {projectList.map((itemProject) => (
              <div
                key={itemProject.name}
                className={clsx(
                  'bg-gray-50 shadow-md p-6 border border-gray-100 sm:p-5',
                  cssModuleClasses['project-card'],
                )}
              >
                <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center sm:text-lg">
                  <FontAwesomeIcon icon={itemProject.icon as IconProp} className={itemProject.iconClassname} />
                  <span className="ml-2">{itemProject.name}</span>
                  <span className="text-gray-500 text-sm ml-2">&nbsp;| {itemProject.company}</span>
                </h3>
                <p className="text-md text-blue-700 font-semibold mb-2 sm:text-base">{t(itemProject.role)}</p>
                <p className="text-gray-700 mb-4 text-justify sm:text-sm">{t(itemProject.description)}</p>
                <p className="text-sm text-gray-600 sm:text-xs">
                  <strong>{t('technologyLabel')}&nbsp;</strong>
                  <span>{itemProject.technologies.join(', ').trim()}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Contact Section */}
      <section
        id="contact"
        className={clsx(
          'py-16 md:py-24 bg-gradient-to-r from-blue-600 to-purple-700 text-white',
          cssModuleClasses['reveal'],
          cssModuleClasses['contact'],
        )}
      >
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h2
            className={clsx('text-4xl font-bold mb-8 mx-auto sm:text-2xl', cssModuleClasses['section-heading-light'])}
          >
            {t('contactSectionTitle')}
          </h2>
          <p className="text-xl leading-relaxed mb-10 opacity-90 sm:text-lg">{t('contactSectionText')}</p>
          <div className="flex flex-col md:flex-row justify-center items-center space-y-6 md:space-y-0 md:space-x-10">
            <a
              href="mailto:hoavannguyen1609@gmail.com"
              className={clsx(
                'flex items-center group justify-center w-full md:w-auto',
                cssModuleClasses['btn-secondary-light'],
              )}
            >
              <FontAwesomeIcon
                icon={faEnvelope}
                className="mr-3 text-white group-hover:text-blue-500 transition duration-300"
              />
              <span className="text-white group-hover:text-blue-500 transition duration-300">{t('sendEmail')}</span>
            </a>
            <a
              href="tel:+84876160901"
              className={clsx(
                'flex items-center group justify-center w-full md:w-auto',
                cssModuleClasses['btn-secondary-light'],
              )}
            >
              <FontAwesomeIcon
                icon={faPhoneAlt}
                style={{ transform: 'rotate(90deg)' }}
                className="mr-3 text-white group-hover:text-blue-500 transition duration-300"
              />
              <span className="text-white group-hover:text-blue-500 transition duration-300">{t('callMe')}</span>
            </a>
            <a
              href="https://zalo.me/+84941470529"
              target="_blank"
              className={clsx(
                'flex items-center group justify-center w-full md:w-auto',
                cssModuleClasses['btn-secondary-light'],
              )}
            >
              <FontAwesomeIcon
                icon={faComments}
                className="mr-3 text-white group-hover:text-blue-500 transition duration-300"
              />
              <span className="text-white group-hover:text-blue-500 transition duration-300">{t('chatZalo')}</span>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
