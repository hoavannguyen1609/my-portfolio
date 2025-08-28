import type { FC } from 'react';

import { clsx } from 'clsx';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { faGitlab } from '@fortawesome/free-brands-svg-icons';
import { faComments, faEnvelope, faMapMarker, faPhone } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import cssModuleClasses from './AppFooter.module.scss';

const AppFooter: FC = () => {
  const { t } = useTranslation();

  useEffect((): void => {
    const appFooterElement = document.querySelector(`.${cssModuleClasses['app-footer']}`);

    if (appFooterElement) {
      appFooterElement.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', function (e) {
          e.preventDefault();

          const target = e.currentTarget as HTMLAnchorElement;
          const href = target.getAttribute('href');
          if (href) {
            const section = document.querySelector(href);
            if (section) {
              section.scrollIntoView({
                behavior: 'smooth',
              });
            }
          }
        });
      });
    }
  }, []);

  return (
    <footer
      className={clsx(
        'mt-16 md:mt-24 bg-gray-900 text-gray-300 py-12 border-t border-gray-800',
        cssModuleClasses['app-footer'],
      )}
    >
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
        <div>
          <div className="w-full flex items-center justify-center mb-4">
            <a href="#" className="block">
              <img
                src="/logo.png"
                alt="Logo"
                className="h-24 rounded-lg object-cover border-1 border-gray-300"
                loading="lazy"
              />
            </a>
          </div>
          <p className="text-gray-400 leading-relaxed text-sm mb-4">
            {t('footerTagline', 'Chuyên gia phát triển phần mềm với niềm đam mê tạo ra các giải pháp sáng tạo.')}
          </p>
          <p
            className="text-sm text-gray-500"
            dangerouslySetInnerHTML={{
              __html: t('footerCopyright', '&copy; 2025 NGUYEN VAN HOA. Mọi quyền được bảo lưu.'),
            }}
          ></p>
        </div>
        <div>
          <h4 className="text-lg font-semibold text-white mb-5">{t('footerQuickLinks', 'Liên kết nhanh')}</h4>
          <ul className="space-y-3">
            <li>
              <a href="#about" className={cssModuleClasses['footer-link']}>
                {t('navAbout', 'Giới thiệu')}
              </a>
            </li>
            <li>
              <a href="#skills" className={cssModuleClasses['footer-link']}>
                {t('navSkills', 'Kỹ năng')}
              </a>
            </li>
            <li>
              <a href="#experience" className={cssModuleClasses['footer-link']}>
                {t('navExperience', 'Kinh nghiệm')}
              </a>
            </li>
            <li>
              <a href="#education" className={cssModuleClasses['footer-link']}>
                {t('navEducation', 'Học vấn')}
              </a>
            </li>
            <li>
              <a href="#projects" className={cssModuleClasses['footer-link']}>
                {t('navProjects', 'Dự án')}
              </a>
            </li>
            <li>
              <a href="#contact" className={cssModuleClasses['footer-link']}>
                {t('navContact', 'Liên hệ')}
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-lg font-semibold text-white mb-5">{t('footerConnect', 'Kết nối với tôi')}</h4>
          <ul className="space-y-3 mb-6">
            <li className="flex items-center justify-center md:justify-start">
              <FontAwesomeIcon icon={faEnvelope} className="mr-3 text-gray-400" />
              <a href="mailto:hoavannguyen1609@gmail.com" className={cssModuleClasses['footer-link']}>
                hoavannguyen1609@gmail.com
              </a>
            </li>
            <li className="flex items-center justify-center md:justify-start">
              <FontAwesomeIcon icon={faPhone} className="mr-3 text-gray-400" />
              <a href="tel:+84876160901" className={cssModuleClasses['footer-link']}>
                +84876160901
              </a>
            </li>
            <li className="flex items-center justify-center md:justify-start">
              <FontAwesomeIcon icon={faMapMarker} className="mr-3 text-gray-400" />
              <a
                href="https://maps.app.goo.gl/C5LgxA1A9v5GsRiy5"
                target="_blank"
                rel="noopener noreferrer"
                className={cssModuleClasses['footer-link']}
              >
                {t('address', 'Trung Hòa, Cầu Giấy, Hà Nội')}
              </a>
            </li>
          </ul>
          <div className="flex justify-center md:justify-start space-x-6 mt-4">
            <a
              href="https://gitlab.com/NguyenVanHoa160901"
              target="_blank"
              className={clsx('hover:text-orange-500', cssModuleClasses['footer-social-icon'])}
              title="GitLab"
              rel="noopener noreferrer"
            >
              <i className="fab fa-gitlab" />
              <FontAwesomeIcon icon={faGitlab} />
            </a>
            {/* <a
        href="https://www.linkedin.com/in/nguyen-van-hoa-160901/"
        target="_blank"
        class="footer-social-icon hover:text-blue-400"
        title="LinkedIn"
        rel="noopener noreferrer"
      >
        <i class="fab fa-linkedin"></i>
      </a> */}
            <a
              href="https://zalo.me/+84941470529"
              target="_blank"
              className={clsx('hover:text-blue-500', cssModuleClasses['footer-social-icon'])}
              title="Zalo"
              rel="noopener noreferrer"
            >
              <FontAwesomeIcon icon={faComments} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;
