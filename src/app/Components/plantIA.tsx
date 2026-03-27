import { motion } from "framer-motion";

export const PlantitaAnimada = () => {
  return (
    <motion.img
      src="/plantIA.png" 
      alt="Plantita feliz"
      initial={{ rotate: -2 }}
      animate={{ rotate: [-2, 2, -2] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      className="w-20 h-20 fixed bottom-[72px] right-4 z-[100]"
    />
  );
};
