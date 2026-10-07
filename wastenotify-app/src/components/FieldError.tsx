/** Inline validation message shown under an input. Renders nothing when clean. */
const FieldError: React.FC<{ message?: string }> = ({ message }) =>
  message ? (
    <p className="mt-1.5 flex items-center gap-1 font-caption text-caption text-error">
      <span className="material-symbols-outlined text-[16px]">error</span>
      {message}
    </p>
  ) : null;

export default FieldError;
