import React from 'react';
import { APP_MOCKUP_1, APP_MOCKUP_2, APP_MOCKUP_3, DEMO_BEFORE_IMG, DEMO_AFTER_IMG, VIDEO_PLACEHOLDER_IMG } from '../constants';
import AnimateOnScroll from '../components/AnimateOnScroll';

const DemoPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <AnimateOnScroll animation="fade-in">
        <h1 className="text-5xl font-extrabold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-primary-light to-secondary-light dark:from-primary-dark dark:to-secondary-dark animate-pulse-effect">
          See TypeMaster in Action
        </h1>
      </AnimateOnScroll>

      <AnimateOnScroll animation="fade-in" delay={200}>
        <p className="text-center text-lg text-gray-700 dark:text-gray-300 mb-16 max-w-2xl mx-auto">
          Explore the intuitive design and powerful features that make TypeMaster AI Keyboard your ultimate typing companion. Experience the future of mobile communication.
        </p>
      </AnimateOnScroll>

      {/* UI Showcase Section */}
      <section className="mb-20">
        <AnimateOnScroll animation="slide-in-left" delay={400}>
          <h2 className="text-4xl font-bold text-center mb-10 text-gray-900 dark:text-gray-100">Sleek Interface, Smart Features</h2>
        </AnimateOnScroll>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <AnimateOnScroll animation="fade-in" delay={600}>
            <div className="rounded-xl shadow-xl overflow-hidden border-2 border-primary-light dark:border-primary-dark transform hover:scale-105 transition-transform duration-300">
              <img src={APP_MOCKUP_1} alt="App UI Screenshot 1" className="w-full h-auto object-cover" />
              <div className="p-4 bg-white bg-opacity-70 dark:bg-gray-800 dark:bg-opacity-70 backdrop-filter backdrop-blur-md text-center">
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">Predictive Text in Action</p>
              </div>
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fade-in" delay={700}>
            <div className="rounded-xl shadow-xl overflow-hidden border-2 border-primary-light dark:border-primary-dark transform hover:scale-105 transition-transform duration-300">
              <img src={APP_MOCKUP_2} alt="App UI Screenshot 2" className="w-full h-auto object-cover" />
              <div className="p-4 bg-white bg-opacity-70 dark:bg-gray-800 dark:bg-opacity-70 backdrop-filter backdrop-blur-md text-center">
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">Custom Theme Selection</p>
              </div>
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fade-in" delay={800}>
            <div className="rounded-xl shadow-xl overflow-hidden border-2 border-primary-light dark:border-primary-dark transform hover:scale-105 transition-transform duration-300">
              <img src={APP_MOCKUP_3} alt="App UI Screenshot 3" className="w-full h-auto object-cover" />
              <div className="p-4 bg-white bg-opacity-70 dark:bg-gray-800 dark:bg-opacity-70 backdrop-filter backdrop-blur-md text-center">
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">Voice Typing Interface</p>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Before/After Typing Examples */}
      <section className="mb-20">
        <AnimateOnScroll animation="slide-in-right" delay={900}>
          <h2 className="text-4xl font-bold text-center mb-10 text-gray-900 dark:text-gray-100">Before & After: The TypeMaster Difference</h2>
        </AnimateOnScroll>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto items-center">
          <AnimateOnScroll animation="fade-in" delay={1000}>
            <div className="flex flex-col items-center p-6 rounded-xl shadow-xl bg-white bg-opacity-70 backdrop-filter backdrop-blur-lg dark:bg-gray-800 dark:bg-opacity-70 border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-semibold mb-4 text-red-500 dark:text-red-400">Before TypeMaster</h3>
              <img src={DEMO_BEFORE_IMG} alt="Typing before TypeMaster" className="w-full h-auto rounded-lg mb-4 object-cover border border-gray-300 dark:border-gray-600" />
              <p className="text-lg text-gray-700 dark:text-gray-300 italic">"I'm tring to quickly send a mesage but my fingrs keep sliping. Autocorretion isnt realy helping much."</p>
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fade-in" delay={1100}>
            <div className="flex flex-col items-center p-6 rounded-xl shadow-xl bg-white bg-opacity-70 backdrop-filter backdrop-blur-lg dark:bg-gray-800 dark:bg-opacity-70 border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-semibold mb-4 text-green-500 dark:text-green-400">After TypeMaster</h3>
              <img src={DEMO_AFTER_IMG} alt="Typing after TypeMaster" className="w-full h-auto rounded-lg mb-4 object-cover border border-gray-300 dark:border-gray-600" />
              <p className="text-lg text-gray-700 dark:text-gray-300 italic">"I'm trying to quickly send a message but my fingers keep slipping. Autocorrection is really helping a lot."</p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Short Video Placeholder */}
      <section className="text-center">
        <AnimateOnScroll animation="fade-in" delay={1200}>
          <h2 className="text-4xl font-bold text-center mb-10 text-gray-900 dark:text-gray-100">Watch the Magic Unfold</h2>
        </AnimateOnScroll>
        <AnimateOnScroll animation="fade-in" delay={1300}>
          <div className="max-w-4xl mx-auto rounded-xl shadow-xl overflow-hidden border-2 border-primary-light dark:border-primary-dark">
            <div className="relative aspect-video bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
              <img src={VIDEO_PLACEHOLDER_IMG} alt="Video Placeholder" className="absolute inset-0 w-full h-full object-cover opacity-80" />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <svg
                  className="w-24 h-24 text-white opacity-90 transform hover:scale-110 transition-transform duration-300 cursor-pointer"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <p className="absolute bottom-4 text-white text-lg font-semibold drop-shadow-lg">
                (Click to play demo video - Placeholder)
              </p>
            </div>
          </div>
        </AnimateOnScroll>
      </section>
    </div>
  );
};

export default DemoPage;