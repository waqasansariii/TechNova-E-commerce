import { motion } from 'framer-motion';

function About() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.div
      className="container mx-auto px-4 sm:px-6 py-8 sm:py-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1
        className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-6 sm:mb-8 text-center"
        variants={sectionVariants}
      >
        About TechNova
      </motion.h1>
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8"
        variants={sectionVariants}
      >
        <div className="flex justify-center">
          <motion.img
            src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/d5f0ffcd-5b16-4baf-a902-d6b754949191.png"
            alt="TechNova Team"
            className="h-32 w-32 sm:h-48 sm:w-48 md:h-64 md:w-64 rounded-full shadow-lg object-cover"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div>
          <motion.p
            className="text-gray-600 text-sm sm:text-base md:text-lg mb-4"
            variants={sectionVariants}
          >
            At TechNova, we're passionate about bringing the latest in technology to your fingertips. Our mission is to provide high-quality, innovative electronics that enhance your life.
          </motion.p>
          <motion.p
            className="text-gray-600 text-sm sm:text-base md:text-lg mb-4"
            variants={sectionVariants}
          >
            Founded in 2023, TechNova has quickly become a trusted name in the electronics industry. We specialize in curating a wide range of products, from smartphones to smart home devices, all backed by our commitment to customer satisfaction.
          </motion.p>
          <motion.p
            className="text-gray-600 text-sm sm:text-base md:text-lg"
            variants={sectionVariants}
          >
            Our team of tech enthusiasts works tirelessly to ensure you get the best products at competitive prices, with a seamless shopping experience.
          </motion.p>
        </div>
      </motion.div>
      <motion.div
        className="mt-8 sm:mt-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 sm:p-8 text-white"
        variants={sectionVariants}
      >
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center">Our Tech Stack</h2>
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
          {['React', 'Node.js', 'MongoDB', 'Stripe', 'JazzCash', 'Tailwind CSS', 'Artificial Intelligence Systems'].map((tech) => (
            <motion.span
              key={tech}
              className="bg-white text-indigo-600 px-3 sm:px-4 py-1 sm:py-2 rounded-full text-sm sm:text-base font-semibold shadow-md"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              {tech}
            </motion.span>
          ))}
        </div>
      </motion.div>
      <motion.div
        className="mt-8 sm:mt-12"
        variants={sectionVariants}
      >
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 text-center">Our E-commerce Expertise</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
          <motion.div
            className="bg-gray-100 p-4 sm:p-6 rounded-lg shadow-md"
            variants={sectionVariants}
          >
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Seamless User Experience</h3>
            <p className="text-gray-600 text-sm sm:text-base">
              We leverage React and Tailwind CSS to craft intuitive, responsive interfaces that ensure a smooth and engaging shopping experience across all devices.
            </p>
          </motion.div>
          <motion.div
            className="bg-gray-100 p-4 sm:p-6 rounded-lg shadow-md"
            variants={sectionVariants}
          >
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Secure Transactions</h3>
            <p className="text-gray-600 text-sm sm:text-base">
              With Stripe and JazzCash integration, we provide secure, fast, and reliable payment processing, supporting both global and local payment methods for customer trust and convenience.
            </p>
          </motion.div>
          <motion.div
            className="bg-gray-100 p-4 sm:p-6 rounded-lg shadow-md"
            variants={sectionVariants}
          >
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Scalable Backend</h3>
            <p className="text-gray-600 text-sm sm:text-base">
              Our Node.js and MongoDB-powered backend ensures high performance, scalability, and efficient handling of product catalogs, user data, and orders.
            </p>
          </motion.div>
          <motion.div
            className="bg-gray-100 p-4 sm:p-6 rounded-lg shadow-md"
            variants={sectionVariants}
          >
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">AI-Driven Personalization</h3>
            <p className="text-gray-600 text-sm sm:text-base">
              Using advanced AI systems, we deliver personalized product recommendations and dynamic pricing to enhance customer satisfaction and engagement.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default About;