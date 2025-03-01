import { Circle, Square, Pencil, LetterText, MoveUpRight, Slash, Eraser } from 'lucide-react'

type ShapeBarProps = {
    shape: string;
    setShape: React.Dispatch<React.SetStateAction<string>>;
};

const shapeOptions = [
    { id: 'circle', icon: <Circle />, label: 'Circle' },
    { id: 'rect', icon: <Square />, label: 'Square' },
    { id: 'pencil', icon: <Pencil />, label: 'Pencil' },
    { id: 'input', icon: <LetterText />, label: 'Input' },
    { id: 'arrow', icon: <MoveUpRight />, label: 'Arrow' },
    { id: 'line', icon: <Slash />, label: 'Line' },
    { id: 'eraser', icon: <Eraser />, label: 'Eraser' }
];

function ShapeBar({ shape, setShape }: ShapeBarProps) {
    const shapeSetting = (e: React.MouseEvent) => {
        setShape(e.currentTarget.id);
    };

    return (
        <div className='absolute top-5 w-screen text-white flex justify-center'>
            <div className='border border-white flex gap-4 px-4 py-2'>
                {shapeOptions.map(({ id, icon }) => (
                    <div
                        key={id}
                        id={id}
                        onClick={shapeSetting}
                        className={`cursor-pointer ${shape === id ? 'text-red-400' : 'text-white'}`}
                    >
                        {icon}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ShapeBar;
