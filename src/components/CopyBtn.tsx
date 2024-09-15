import { useState } from 'react';

const CopyBtn = ({ value }: { value?: string }) => {
  const [isCopied, setIsCopied] = useState(false);

  const onCopy = async () => {
    if (!value) {
      return;
    }
    setIsCopied(true);
    await navigator.clipboard.writeText(value);
    setTimeout(() => {
      setIsCopied(false);
    }, 1000);
  };

  const Icon = isCopied ? 'Copied' : 'Copy';

  return (
    <button onClick={onCopy} disabled={!value || isCopied} className="z-5 hover:text-black">
      {Icon}
    </button>
  );
};

export default CopyBtn;
