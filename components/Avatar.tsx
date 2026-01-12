import Image from "next/image";
import { FaUserCircle } from "react-icons/fa";
const Avatar = ({ src }: { src: string }) => {
  if (src) {
    return (
      <div className="w-8 h-8 sm:w-10 sm:h-10 overflow-hidden rounded-full">
        <Image
          src={src}
          alt="Avatar"
          width={40}
          height={40}
          className="rounded-full object-cover w-full h-full"
        />
      </div>
    );
  }
  return (
    <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-slate-100 overflow-hidden">
      <FaUserCircle size={20} />
    </div>
  );
};

export default Avatar;
