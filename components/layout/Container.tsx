const Container = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="max-w-[1920px] w-full mx-auto px-4 sm:px-6 md:px-8 lg:px-20 py-3 sm:py-4">
      {children}
    </div>
  );
};
export default Container;
