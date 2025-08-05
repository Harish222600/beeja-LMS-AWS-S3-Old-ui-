export default function IconBtn({
  text,
  onClick,
  children,
  disabled,
  outline = false,
  customClasses,
  type = "button",
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      type={type}
      className={`flex items-center ${
        outline ? "border border-yellow-50 bg-transparent text-yellow-50" : "bg-yellow-50 text-richblack-900"
      } cursor-pointer gap-x-2 rounded-md py-2 px-5 font-semibold ${
        disabled ? "cursor-not-allowed opacity-50" : ""
      } ${customClasses}`}
    >
      {children}
      {text}
    </button>
  )
}
