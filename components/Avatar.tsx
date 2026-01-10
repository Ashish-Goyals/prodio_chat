import Image from "next/image";
import { FaUserCircle } from "react-icons/fa";
const Avatar = ({ src }: { src: string }) => {
  if (src) {
    return (
      <div>
        <Image
          src={src}
          alt="Avatar"
          width={40}
          height={40}
          className="rounded-full object-cover"
        />
      </div>
    );
  }
  return (
    <div>
      <FaUserCircle size={24} />
    </div>
  );
};

export default Avatar;
