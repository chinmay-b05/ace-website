import { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function Quill({ initialValue = '', name }: { initialValue?: string; name: string }) {
  const [value, setValue] = useState(initialValue);

  return (
    <>
      <ReactQuill theme="snow" value={value} onChange={setValue} />
      <input type="text" defaultValue={value} hidden name={name} />

      <strong className="mt-4">Preview</strong>
      {value == '' ? (
        <p className="text-gray-400">write something in the editor...</p>
      ) : (
        <div dangerouslySetInnerHTML={{ __html: value }}></div>
      )}
    </>
  );
}
