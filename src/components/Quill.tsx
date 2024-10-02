import { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function Quill({ initialValue = '', name }: { initialValue?: string; name: string }) {
  const [value, setValue] = useState(initialValue);

  return (
    <div>
      <ReactQuill theme="snow" value={value} onChange={setValue} />
      <input type="text" defaultValue={value} hidden name={name} />

      {/* preview */}
      {/* <div dangerouslySetInnerHTML={{ __html: value }}></div> */}
    </div>
  );
}
