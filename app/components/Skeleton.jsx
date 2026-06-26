// components/Skeleton.jsx

const Skeleton = ({
  width = '100%',
  height = '20px',
  borderRadius = '6px',
  className = ''
}) => {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width: width,
        height: height,
        borderRadius: borderRadius,
      }}
    />
  );
};

export default Skeleton