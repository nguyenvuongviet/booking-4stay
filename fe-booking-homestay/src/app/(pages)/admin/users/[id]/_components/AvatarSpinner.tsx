export function AvatarSpinner() {
  return (
    <div className="relative w-16 h-16">
      <div
        className="absolute w-full h-full rounded-full border-[3px]
        border-gray-100/10 border-r-cyan-400 border-b-cyan-400
        animate-spin"
        style={{ animationDuration: "3s" }}
      ></div>
      <div
        className="absolute w-full h-full rounded-full border-[3px]
        border-gray-100/10 border-t-cyan-400 animate-spin"
        style={{ animationDuration: "2s", animationDirection: "reverse" }}
      ></div>
      <div
        className="absolute inset-0 bg-linear-to-tr from-cyan-400/10
        via-transparent to-cyan-400/5 animate-pulse rounded-full blur-sm"
      ></div>
    </div>
  );
}
