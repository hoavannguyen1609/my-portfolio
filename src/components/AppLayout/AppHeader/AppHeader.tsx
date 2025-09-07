import type { FC, MouseEvent } from 'react';

import { clsx } from 'clsx';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { faGlobe, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Form, Select } from 'antd';

import { LANGUAGE_EN, LANGUAGE_VI } from '@/constants';
import { getLanguage } from '@/utils';

import cssModuleClasses from './AppHeader.module.scss';

const AppHeader: FC = () => {
  const { t, i18n } = useTranslation();
  const [formLanguage] = Form.useForm();

  const handleChangeLanguage = (value: string): void => {
    i18n.changeLanguage(value);
  };

  const handleToggleMobileMenu = (): void => {
    const mobileMenuElement = document.querySelector(`.${cssModuleClasses['mobile-menu']}`);

    if (mobileMenuElement) {
      mobileMenuElement.classList.toggle(cssModuleClasses['show']);
    }
  };

  const handleSelectMobileMenu = (e: MouseEvent<HTMLLIElement>): void => {
    e.preventDefault();
    e.stopPropagation();

    const mobileMenuElement = document.querySelector(`.${cssModuleClasses['mobile-menu']}`);

    if (mobileMenuElement && mobileMenuElement.classList.contains(cssModuleClasses['show'])) {
      mobileMenuElement.classList.remove(cssModuleClasses['show']);
    }
  };

  useEffect((): void => {
    formLanguage.setFieldValue('language', getLanguage());

    const appFooterElement = document.querySelector(`.${cssModuleClasses['app-header']}`);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <header className={clsx('bg-white shadow-lg sticky top-0 z-50', cssModuleClasses['app-header'])}>
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <a href="#" className="text-3xl font-extrabold text-gray-900 tracking-wider md:text-2xl lg:text-3xl">
          <img src="./logo.png" alt="Logo" className="h-18 object-contain" />
        </a>
        <div className="flex items-center gap-x-4 md:gap-x-8">
          <div className="hidden md:flex gap-x-8 items-center">
            <a href="#about" className={clsx('relative pb-1', cssModuleClasses['nav-link'])}>
              {t('navAbout', 'Về tôi')}
            </a>
            <a href="#skills" className={clsx('relative pb-1', cssModuleClasses['nav-link'])}>
              {t('navSkills', 'Kỹ năng')}
            </a>
            <a href="#experience" className={clsx('relative pb-1', cssModuleClasses['nav-link'])}>
              {t('navExperience', 'Kinh nghiệm')}
            </a>
            <a href="#education" className={clsx('relative pb-1', cssModuleClasses['nav-link'])}>
              {t('navEducation', 'Học vấn')}
            </a>
            <a href="#projects" className={clsx('relative pb-1', cssModuleClasses['nav-link'])}>
              {t('navProjects', 'Dự án')}
            </a>
            <a href="#contact" className={clsx('relative pb-1', cssModuleClasses['nav-link'])}>
              {t('navContact', 'Liên hệ')}
            </a>
          </div>
          <div className="flex items-center">
            <Form
              form={formLanguage}
              initialValues={{
                language: LANGUAGE_VI,
              }}
            >
              <Form.Item
                name="language"
                style={{
                  marginBottom: 0,
                }}
              >
                <Select
                  className="w-32"
                  prefix={<FontAwesomeIcon icon={faGlobe} />}
                  options={[
                    {
                      value: LANGUAGE_VI,
                      label: 'Việt Nam',
                    },
                    {
                      value: LANGUAGE_EN,
                      label: 'English',
                    },
                  ]}
                  onChange={handleChangeLanguage}
                />
              </Form.Item>
            </Form>
          </div>
          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-600 focus:outline-none p-2 rounded-md hover:bg-gray-100 transition duration-300"
            onClick={handleToggleMobileMenu}
          >
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>
      </nav>
      {/* Mobile Menu */}
      <div className={clsx('md:hidden bg-white shadow-lg fixed', cssModuleClasses['mobile-menu'])}>
        <div className="flex items-center justify-between p-3 shadow-lg">
          <div className="w-1/3">
            <img className="w-full object-contain" src="./logo.png" alt="Logo" loading="lazy" />
          </div>
          <div className="">
            <button
              className={clsx(
                'md:hidden text-gray-600 focus:outline-none p-2 rounded-md hover:bg-gray-100 transition duration-300 overflow-hidden w-10 h-10 flex justify-center items-center text-2xl font-medium',
                cssModuleClasses['mobile-menu-close-button'],
              )}
              onClick={handleToggleMobileMenu}
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>
        </div>
        <div className="p-3 overflow-hidden">
          <ul className={clsx('flex flex-col items-start gap-y-2', cssModuleClasses['mobile-menu__list'])}>
            <li onClick={handleSelectMobileMenu} className="w-full">
              <a href="#about" className="block px-3 py-3 text-gray-800 hover:bg-gray-100 transition duration-300">
                {t('navAbout', 'Về tôi')}
              </a>
            </li>
            <li onClick={handleSelectMobileMenu} className="w-full">
              <a href="#skills" className="block px-3 py-3 text-gray-800 hover:bg-gray-100 transition duration-300">
                {t('navSkills', 'Kỹ năng')}
              </a>
            </li>
            <li onClick={handleSelectMobileMenu} className="w-full">
              <a href="#experience" className="block px-3 py-3 text-gray-800 hover:bg-gray-100 transition duration-300">
                {t('navExperience', 'Kinh nghiệm')}
              </a>
            </li>
            <li onClick={handleSelectMobileMenu} className="w-full">
              <a href="#education" className="block px-3 py-3 text-gray-800 hover:bg-gray-100 transition duration-300">
                {t('navEducation', 'Học vấn')}
              </a>
            </li>
            <li onClick={handleSelectMobileMenu} className="w-full">
              <a href="#projects" className="block px-3 py-3 text-gray-800 hover:bg-gray-100 transition duration-300">
                {t('navProjects', 'Dự án')}
              </a>
            </li>
            <li onClick={handleSelectMobileMenu} className="w-full">
              <a href="#contact" className="block px-3 py-3 text-gray-800 hover:bg-gray-100 transition duration-300">
                Liên hệ
              </a>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
