const ActivityCard = ({
  children,
  className = "",
  onClick,
  onKeyDown,
  role,
  tabIndex,
}) => {
  return (
    <article
      role={role}
      tabIndex={tabIndex}
      onClick={onClick}
      onKeyDown={onKeyDown}
      className={["rounded-2xl bg-white p-4", className].filter(Boolean).join(" ")}
    >
      {children}
    </article>
  );
};

export default ActivityCard;
