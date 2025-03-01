import React, { useState, useEffect, useRef } from 'react'
import { Context } from 'vm';
import ShapeBar from '../components/ShapeBar';
import { token } from './Auth';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { BACKEND_URL } from '../config';

function RoomCanvas() {

    type Shape = 'circle' | 'rect' | 'eraser' | 'pencil' | 'text' | 'line' | 'arrow';
    interface RectType {
        sx: number,
        sy: number,
        cx: number,
        cy: number
    }

    interface EcllipseType {
        sx: number,
        sy: number,
        cx: number,
        cy: number
    }

    interface lineType {
        sx: number,
        sy: number,
        cx: number,
        cy: number
    }


    interface PencilShape {
        sx: number,
        sy: number,
        cx: number,
        cy: number
    }

    interface ArrowType {
        sx: number,
        sy: number,
        cx: number,
        cy: number,
    }

    interface InputType {
        cx: number,
        cy: number,
        text: string
    }

    interface PencilPathsType {
        cx: number;
        cy: number
    }
    interface PencilShapeType {
        sx: number,
        sy: number,
        cx: number,
        cy: number
    }

    const [rectShape, setRectShape] = useState<RectType[]>([]);
    const [ecllipseShape, setEcllipseShape] = useState<EcllipseType[]>([]);
    const [lineShape, setLineShape] = useState<lineType[]>([]);
    const [arrowShape, setArrowShape] = useState<ArrowType[]>([]);
    const [inputData, setInputData] = useState<InputType[]>([]);
    const [_pencilPaths, setPencilPaths] = useState<PencilPathsType[][]>([]);
    const [pencilShape, setPencilShape] = useState<PencilShapeType[]>([]);
    // let pencilShape = [];
    //@ts-ignore
    const { slug } = useParams<{ slug: string }>();
    const [slugState] = useState<string | null>(slug ?? null);



    // console.log(slugState + " this is slug value");

    const [ws, setWs] = useState<WebSocket>();

    const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);


    let currentPath: { cx: number, cy: number }[] = [];



    const renderAllShapes = (context: CanvasRenderingContext2D) => {
        context.clearRect(0, 0, window.innerWidth, window.innerHeight);

        // Render rectangles
        rectShape?.forEach(rect => drawRect(context, rect));

        // Render ellipses
        ecllipseShape?.forEach(ellipse => drawEcllipse(context, ellipse));

        // Render lines
        lineShape?.forEach(line => drawLine(context, line));

        // Render arrows
        arrowShape?.forEach(arrow => drawArrow(context, arrow));

        // Render pencil strokes
        pencilShape?.forEach(pencil => drawPencil(context, pencil));

        // Render text
        inputData?.forEach(input => drawText(context, input));
    };

    let inputValue: string;

    useEffect(() => {
        if (ctx) {
            renderAllShapes(ctx);
        }
    }, [rectShape, ecllipseShape, lineShape, arrowShape, pencilShape, inputData]);


    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    // let [draw, setDraw] = useState<boolean>(false);
    let draw = false;
    let startX = 0, startY = 0, currentX = 0, currentY = 0;

    let [shape, setShape] = useState('circle');

    // ctx.ellipse(startX, startY, Math.abs(currentX - startX), Math.abs(currentY - startY), Math.PI * 1, 0, Math.PI * 2);
    const [inputActive, setInputActive] = useState(false);
    const [inputPos, setInputPos] = useState({ x: 0, y: 0 });
    const inputRef = useRef(null);
    const settingCtx = async () => {
        if (canvasRef.current) {
            // console.log(canvasRef.current)

            const context = await canvasRef.current.getContext("2d");
            // console.log(context);
            if (!context) {
                settingCtx();
            }
            setCtx(context);
            // console.log(ctx)
        }
    }

    useEffect(() => {
        settingCtx();

        //@ts-ignore
        const wsc = new WebSocket(`ws://localhost:3000?token=${token}`);
        setWs(wsc);
        wsc.onopen = () => {
            // console.log("joining room...");
            wsc?.send(JSON.stringify({
                type: "join_room",
                slug: slugState
            }))
            console.log('room joined successfully');
        }

        wsc.onmessage = (message) => {
            // console.log("message received " + message.data);

            const parsedData = JSON.parse(message.data);
            // console.log(parsedData);
            // console.log(JSON.stringify(parsedData) + " this is my parsedDAta");

            if (parsedData.type === 'chat') {
                const parsedMessage = JSON.parse(parsedData.message);

                let shape = parsedMessage.type;
                let message = parsedMessage
                console.log(ctx + " i am ctx present")

                renderShapes(shape, message);

            }


            if (parsedData.type === 'eraser') {
                // console.log("inside eraser mession succesfuul")
                let shape = parsedData.shape;
                let message = parsedData.message.updatedShapes;
                // console.log(shape)
                // console.log(message);
                switch (shape) {
                    case 'rect': {
                        //@ts-ignore
                        // console.log('rectangel shape came')
                        setRectShape(message);
                    }
                        break;
                    case 'circle': {
                        //@ts-ignore
                        setEcllipseShape(message);
                        // console.log(ctx);

                    }
                        break;
                    case 'line': {
                        //@ts-ignore
                        setLineShape(message)

                    }
                        break;
                    case 'arrow': {
                        //@ts-ignore
                        setArrowShape(message)


                    }
                        break;
                    case 'text': {
                        //@ts-ignore
                        setInputData(message)
                    }
                        break;
                    case 'pencil': {
                        // console.log("atleast coming inside pencil eraser")
                        setPencilShape([]);
                    }
                        break;


                    default: {
                        break;
                    }
                }

            }
        }

        wsc.onclose = () => {
            console.log("ws connection closed")
        }



        const fetchShapes = async () => {
            try {
                const response = await axios.get(`${BACKEND_URL}/api/chats/${slugState}`);
                // console.log(JSON.stringify(response.data));

                if (!response.data.success) {
                    console.error("Failed to fetch shapes:", response.data);
                    return;
                }

                return response.data.data; // Return the array of shapes
            } catch (error) {
                console.error("Error fetching shapes:", error);
            }
        };

        // Call fetchShapes and process the data
        const fetchAndRenderShapes = async () => {
            const shapesData = await fetchShapes(); // Wait for the data to be fetched

            if (shapesData && Array.isArray(shapesData)) {
                shapesData.forEach(element => {
                    try {
                        const message = JSON.parse(element.message); // Parse the message string
                        renderShapes(message.type, message); // Render the shape
                    } catch (error) {
                        console.error("Error parsing shape message:", error);
                    }
                });
            }
        };

        // Execute the fetch and render process
        fetchAndRenderShapes();



    }, [slugState]);



    function renderShapes(shape: Shape, message: RectType | EcllipseType | lineType | ArrowType | InputType | PencilShapeType[]) {
        // console.log(shape);
        // console.log(message);
        switch (shape) {
            case 'rect': {
                // console.log('rectangel shape came')
                //@ts-ignore
                setRectShape(prev => [...prev, { sx: message.sx, sy: message.sy, cx: message.cx, cy: message.cy }]);
            }
                break;
            case 'circle': {
                //@ts-ignore
                setEcllipseShape(prev => [...prev, { sx: message.sx, sy: message.sy, cx: message.cx, cy: message.cy }]);
                // console.log(ctx);
            }
                break;
            case 'line': {
                //@ts-ignore
                setLineShape(prev => [...prev, { sx: message.sx, sy: message.sy, cx: message.cx, cy: message.cy }])
            }
                break;
            case 'arrow': {
                //@ts-ignore
                setArrowShape(prev => [...prev, { sx: message.sx, sy: message.sy, cx: message.cx, cy: message.cy }])
            }
                break;
            case 'text': {
                //@ts-ignore
                setInputData(prev => [...prev, { text: message.text, cx: message.cx, cy: message.cy }])
                // console.log(inputData)
            }
                break;
            case 'pencil': {
                //@ts-ignore
                setPencilShape(message.message);
            }
                break;


            default: {
                break;
            }
        }
    }


    const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {

        // setDraw(true);
        draw = true;
        startX = e.clientX;
        startY = e.clientY;

        if (shape == 'input' && !inputActive && ctx) {
            setInputPos({ x: startX, y: startY });
            setInputActive(true);
        }

        if (shape == 'input' && inputActive && ctx) {
            //@ts-ignore
            inputValue = inputRef?.current?.value;
            //@ts-ignore

            //@ts-ignore
            inputRef?.current?.focus();
            // console.log(inputValue);

            if (!inputValue) { return };

            if (inputValue.trim() !== "") {
                ctx.font = "20px Arial";
                ctx.fillStyle = "white";
                ctx.fillText(inputValue, inputPos.x, inputPos.y + 23);

                setInputData((prev) => [...prev, { text: inputValue, cx: inputPos.x, cy: inputPos.y + 23 }]);


                ws?.send(JSON.stringify({ type: 'chat', slug: slugState, message: { type: 'text', text: inputValue, cx: inputPos.x, cy: inputPos.y + 23 } }))

            }
            setInputActive(false);

        }

    }

    const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!draw || !ctx) return;
        currentX = e.clientX;
        currentY = e.clientY;

        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        // ctx.strokeStyle = "white";
        if (shape === 'rect') {
            drawRect(ctx, { sx: startX, sy: startY, cx: currentX - startX, cy: currentY - startY });
        }

        rectShape?.forEach(rect => {
            drawRect(ctx, rect);
        });


        if (shape === 'circle' && ctx) {
            // console.log(startX + " startx vlae")
            drawEcllipse(ctx, { sx: startX, sy: startY, cx: Math.abs(currentX - startX), cy: Math.abs(currentY - startY) })

        }
        ecllipseShape?.forEach(ecllipse => {
            drawEcllipse(ctx, ecllipse);
        })

        if (shape === 'line') {
            drawLine(ctx, { sx: startX, sy: startY, cx: currentX, cy: currentY });
        }

        lineShape?.forEach(lineShape => {
            drawLine(ctx, lineShape)
        })



        if (shape === 'pencil') {

            ctx?.beginPath();
            currentPath.push({ cx: e.clientX, cy: e.clientY });
            if (currentPath.length <= 2) {
                ctx.moveTo(currentPath[currentPath.length - 1].cx, currentPath[currentPath.length - 1].cy);
            } else {
                drawPencil(ctx, { sx: currentPath[currentPath.length - 2].cx, sy: currentPath[currentPath.length - 2].cy, cx: currentX, cy: currentY });
                //@ts-ignore
                pencilShape.push({ sx: currentPath[currentPath.length - 2].cx, sy: currentPath[currentPath.length - 2].cy, cx: e.clientX, cy: e.clientY });
                // pencilShape(prev => [...prev, { sx: currentPath[currentPath.length - 2].cx, sy: currentPath[currentPath.length - 2].cy, cx: e.clientX, cy: e.clientY }])
            }
        }
        pencilShape?.forEach((pencilData) => {
            drawPencil(ctx, pencilData);
        })

        if (shape === 'arrow') {
            drawArrow(ctx, { sx: startX, sy: startY, cx: currentX, cy: currentY });
        }
        arrowShape?.forEach(arrowShape => {
            drawArrow(ctx, arrowShape);

        })

        inputData?.forEach(inputData => {
            drawText(ctx, inputData);
        })

        if (shape == 'eraser') {
            rectShape?.forEach(rect => {

                // Erase Rectangle
                if (isEraserTouchingRectangle(currentX, currentY, rect)) {
                    // console.log("eraser is touching rectangle")
                    eraseRectangle(currentX, currentY);
                }

            });


            lineShape?.forEach(line => {
                // Erase line
                if (isEraserTouchingLine(currentX, currentY, line)) {
                    // console.log("eraser is touching line")
                    eraseLine(currentX, currentY);
                }

            });

            arrowShape?.forEach(arrow => {
                // Erase line
                if (isEraserTouchingArrow(currentX, currentY, arrow)) {
                    // console.log("eraser is touching arrow")
                    eraseArrow(currentX, currentY);
                }

            });


            ecllipseShape?.forEach(ecllipse => {
                // Erase line
                if (isEraserTouchingLine(currentX, currentY, ecllipse)) {
                    // console.log('eraser is touching ecclipse')
                    eraseEcllipse(currentX, currentY);
                }

            });

            inputData?.forEach(text => {
                // Erase line
                if (isEraserTouchingText(currentX, currentY, text)) {
                    // console.log("eraser is touching text")
                    eraseText(currentX, currentY);
                }

            });

            pencilShape?.forEach(shape => {
                if (isEraserTouchingPencil(currentX, currentY, shape)) {
                    // console.log("eraser is toucning")
                    erasePencil();

                }
            })

        }


        function eraseRectangle(eraserX: number, eraserY: number) {
            // console.log('before filter', rectShape);

            setRectShape(prev => {
                const updatedRect = [];
                const erasedRect = [];

                const updated = prev.filter(rect => !isEraserTouchingRectangle(eraserX, eraserY, rect));
                // console.log('Updated rectShape:', updated);

                for (const rect of prev) {
                    if (isEraserTouchingRectangle(eraserX, eraserY, rect)) {
                        erasedRect.push(rect);
                    } else {
                        updatedRect.push(rect);
                    }
                }

                // Send WebSocket message inside the callback to ensure we have the updated state
                ws?.send(JSON.stringify({
                    type: 'eraser',
                    slug: slugState,
                    shape: 'rect',
                    message: {

                        updatedShapes: updated
                    }
                }));

                if (erasedRect.length > 0) {
                    // console.log(erasedRect);
                    ws?.send(JSON.stringify({
                        type: "eraseBackend",
                        slug: slugState,
                        shape: "rect",
                        message: erasedRect,
                    }));
                }

                return updatedRect;
            });
        }

        function eraseLine(eraserX: number, eraserY: number) {
            setLineShape((prevLines) => {
                const updatedLines = [];
                const erasedLines = [];

                // Single loop to filter lines instead of calling filter twice
                for (const line of prevLines) {
                    if (isEraserTouchingLine(eraserX, eraserY, line)) {
                        erasedLines.push(line);
                    } else {
                        updatedLines.push(line);
                    }
                }

                // console.log("Updated rectShape:", updatedLines);

                // Send WebSocket messages after state update
                ws?.send(JSON.stringify({
                    type: "eraser",
                    slug: slugState,
                    shape: "line",
                    message: { updatedShapes: updatedLines },
                }));

                if (erasedLines.length > 0) {
                    // console.log(erasedLines);
                    ws?.send(JSON.stringify({
                        type: "eraseBackend",
                        slug: slugState,
                        shape: "line",
                        message: erasedLines,
                    }));
                }

                return updatedLines;
            });
        }

        function eraseArrow(eraserX: number, eraserY: number) {

            // setArrowShape(arrow);

            setArrowShape(prev => {

                const updatedArrow = [];
                const erasedArrow = [];
                // const arrows = arrowShape.filter(arrow => !isEraserTouchingArrow(eraserX, eraserY, arrow));
                // console.log('Updated rectShape:', arrow);

                for (const arrow of prev) {
                    if (isEraserTouchingArrow(eraserX, eraserY, arrow)) {
                        erasedArrow.push(arrow);
                    } else {
                        updatedArrow.push(arrow);
                    }
                }
                // Send WebSocket message inside the callback to ensure we have the updated state
                ws?.send(JSON.stringify({
                    type: 'eraser',
                    slug: slugState,
                    shape: 'arrow',
                    message: {

                        updatedShapes: updatedArrow
                    }
                }));

                if (eraseArrow.length > 0) {
                    // console.log(eraseArrow);
                    ws?.send(JSON.stringify({
                        type: "eraseBackend",
                        slug: slugState,
                        shape: "arrow",
                        message: erasedArrow,
                    }));
                }

                return updatedArrow;
            });

            // ws?.send(JSON.stringify({ type: 'eraser', slug: slugState, shape: 'arrow', message: arrow }))
        }

        function eraseEcllipse(eraserX: number, eraserY: number) {

            // setEcllipseShape(ecllipse);
            setEcllipseShape(prev => {

                const updatedEcllipses = [];
                const erasedEcllipse = [];

                // const ecllipse = ecllipseShape.filter(ecllipse => !isTouchingEllipse(eraserX, eraserY, ecllipse));
                // console.log('Updated rectShape:', lines);

                for (const ecllipse of prev) {
                    if (isTouchingEllipse(eraserX, eraserY, ecllipse)) {
                        erasedEcllipse.push(ecllipse);
                    } else {
                        updatedEcllipses.push(ecllipse);
                    }
                }

                // Send WebSocket message inside the callback to ensure we have the updated state
                ws?.send(JSON.stringify({
                    type: 'eraser',
                    slug: slugState,
                    shape: 'circle',
                    message: {

                        updatedShapes: updatedEcllipses
                    }
                }));

                if (eraseEcllipse.length > 0) {
                    // console.log(erasedEcllipse);
                    ws?.send(JSON.stringify({
                        type: "eraseBackend",
                        slug: slugState,
                        shape: "circle",
                        message: erasedEcllipse,
                    }));
                }


                return updatedEcllipses;
            });
            // ws?.send(JSON.stringify({ type: 'eraser', slug: slugState, shape: 'circle', message: ecllipse }));

        }

        function eraseText(eraserX: number, eraserY: number) {

            // setInputData(text);
            setInputData(prev => {
                const updatedText = [];
                const erasedText = [];

                // const text = inputData.filter(text => !isEraserTouchingText(eraserX, eraserY, text));
                // console.log('Updated rectShape:', lines);

                for (const text of prev) {
                    if (isEraserTouchingText(eraserX, eraserY, text)) {
                        erasedText.push(text);
                    } else {
                        updatedText.push(text);
                    }
                }
                // Send WebSocket message inside the callback to ensure we have the updated state
                ws?.send(JSON.stringify({
                    type: 'eraser',
                    slug: slugState,
                    shape: 'text',
                    message: {

                        updatedShapes: updatedText
                    }
                }));

                if (eraseText.length > 0) {
                    // console.log(eraseText);
                    ws?.send(JSON.stringify({
                        type: "eraseBackend",
                        slug: slugState,
                        shape: "text",
                        message: erasedText,
                    }));
                }


                return updatedText;
            });
            // ws?.send(JSON.stringify({ type: 'eraser', slug: slugState, shape: 'text', message: text }))

        }

        function erasePencil() {

            ws?.send(JSON.stringify({
                type: 'eraser',
                slug: slugState,
                shape: 'pencil',
                message: {

                    updatedShapes: []
                }
            }));

            ws?.send(JSON.stringify({
                type: 'eraseBackend',
                slug: slugState,
                shape: 'pencil',
                message: pencilShape
            }));
            setPencilShape([]);
            // setPencilShape([])
        }

        function isEraserTouchingRectangle(eraserX: number, eraserY: number, rect: RectType) {
            const left = rect.sx;
            const right = rect.sx + rect.cx;
            const top = rect.sy;
            const bottom = rect.sy + rect.cy;

            // Check if the eraser is within the rectangle borders
            return (
                eraserX >= left && eraserX <= right &&
                eraserY >= top && eraserY <= bottom
            );
        }

        // Erase Line

        function isEraserTouchingLine(eraserX: number, eraserY: number, line: lineType) {
            let eraserRadius = 10;
            const A = eraserY - line.sy;
            const B = line.cx - line.sx;
            const C = line.cy - line.sy;
            const D = eraserX - line.sx;

            const dot = A * C + D * B;
            const lenSq = C * C + B * B;
            const param = lenSq !== 0 ? dot / lenSq : -1;

            let closestX, closestY;
            if (param < 0) {
                closestX = line.sx;
                closestY = line.sy;
            } else if (param > 1) {
                closestX = line.cx;
                closestY = line.cy;
            } else {
                closestX = line.sx + param * B;
                closestY = line.sy + param * C;
            }

            const distance = Math.hypot(eraserX - closestX, eraserY - closestY);
            return distance <= eraserRadius;
        }


        function isEraserTouchingArrow(eraserX: number, eraserY: number, line: lineType) {
            let eraserRadius = 10;
            const A = eraserY - line.sy;
            const B = line.cx - line.sx;
            const C = line.cy - line.sy;
            const D = eraserX - line.sx;

            const dot = A * C + D * B;
            const lenSq = C * C + B * B;
            const param = lenSq !== 0 ? dot / lenSq : -1;

            let closestX, closestY;
            if (param < 0) {
                closestX = line.sx;
                closestY = line.sy;
            } else if (param > 1) {
                closestX = line.cx;
                closestY = line.cy;
            } else {
                closestX = line.sx + param * B;
                closestY = line.sy + param * C;
            }

            const distance = Math.hypot(eraserX - closestX, eraserY - closestY);
            return distance <= eraserRadius;
        }

        // function isEraserTouchingPencil(eraserX: number, eraserY: number, pencil: PencilShapeType) {

        //     // return (eraserX === pencil.cx && eraserY === pencil.cy || eraserX === pencil.sx && eraserY === pencil.sy);
        //     return (isEraserInRange(eraserX, eraserY, pencil))
        // }
        function isEraserTouchingPencil(eraserX: number, eraserY: number, pencil: PencilShapeType) {
            // Check for the first set of pencil coordinates (cx, cy)
            const inRangeCX = Math.abs(eraserX - pencil.cx) <= 5 && Math.abs(eraserY - pencil.cy) <= 5;

            // Check for the second set of pencil coordinates (sx, sy)
            const inRangeSX = Math.abs(eraserX - pencil.sx) <= 5 && Math.abs(eraserY - pencil.sy) <= 5;

            // Return true if the eraser is within range of either set of coordinates
            return inRangeCX || inRangeSX;
        }

        // erase ecclipse

        function isTouchingEllipse(eraserX: number, eraserY: number, ellipse: EcllipseType) {
            const dx = eraserX - ellipse.sx;
            const dy = eraserY - ellipse.sy;
            return (dx * dx) / (ellipse.cx * ellipse.cx) + (dy * dy) / (ellipse.cy * ellipse.cy) <= 1;
        }

        // erase texxt
        function isEraserTouchingText(eraserX: number, eraserY: number, text: InputType) {
            const textLeft = text.cx;
            const textRight = text.cx + 100; // Approximate text width
            const textTop = text.cy;
            const textBottom = text.cy + 20; // Approximate text height

            return (
                eraserX >= textLeft && eraserX <= textRight &&
                eraserY >= textTop && eraserY <= textBottom
            );
        }

    };


    const onMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {

        // setDraw(false);
        draw = false;

        switch (shape) {
            case 'rect': {
                setRectShape(prev => [...prev, { sx: startX, sy: startY, cx: e.clientX - startX, cy: e.clientY - startY }]);
                ws?.send(JSON.stringify({ type: 'chat', slug: slugState, message: { type: 'rect', sx: startX, sy: startY, cx: e.clientX - startX, cy: e.clientY - startY } }))

            }
                break;
            case 'circle': {
                setEcllipseShape(prev => [...prev, { sx: startX, sy: startY, cx: Math.abs(e.clientX - startX), cy: Math.abs(e.clientY - startY) }]);
                ws?.send(JSON.stringify({ type: 'chat', slug: slugState, message: { type: 'circle', sx: startX, sy: startY, cx: Math.abs(e.clientX - startX), cy: Math.abs(e.clientY - startY) } }))
            }
                break;
            case 'line': {
                setLineShape(prev => [...prev, { sx: startX, sy: startY, cx: e.clientX, cy: e.clientY }])
                ws?.send(JSON.stringify({ type: 'chat', slug: slugState, message: { type: 'line', sx: startX, sy: startY, cx: e.clientX, cy: e.clientY } }))

            }
                break;
            case 'arrow': {
                setArrowShape(prev => [...prev, { sx: startX, sy: startY, cx: currentX, cy: currentY }])
                ws?.send(JSON.stringify({ type: 'chat', slug: slugState, message: { type: 'arrow', sx: startX, sy: startY, cx: currentX, cy: currentY } }))

            }
                break;



            case 'pencil': {
                setPencilPaths(prev => [...prev, currentPath]);
                ws?.send(JSON.stringify({ type: 'chat', slug: slugState, message: { type: 'pencil', message: pencilShape } }))

                // console.log("this is pencil shape " + JSON.stringify(pencilShape))

            }
                break;


            default: {
                break;
            }
        }
    };



    // const redraw = (ctx: Context) => {
    //     // ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    //     pencilPaths.forEach(path => {
    //         ctx.beginPath();
    //         path.forEach((point, index) => {
    //             ctx.moveTo(point.x, point.y);
    //             ctx.lineTo(point.x, point.y);
    //         });
    //         ctx.lineWidth = 1;
    //         ctx.strokeStyle = "white";
    //         ctx.stroke();
    //     });
    // };







    const drawRect = (ctx: Context, rect: RectType) => {
        ctx.beginPath();
        ctx.rect(rect.sx, rect.sy, rect.cx, rect.cy);
        ctx.strokeStyle = "white";
        ctx.stroke();
        // ctx.closePath();
    }

    const drawEcllipse = (ctx: Context, ecllipse: EcllipseType) => {
        ctx.beginPath();
        ctx.ellipse(ecllipse.sx, ecllipse.sy, ecllipse.cx, ecllipse.cy, Math.PI * 1, 0, Math.PI * 2);
        ctx.lineWidth = 1;
        ctx.strokeStyle = "white";
        ctx.stroke();
    }

    const drawLine = (ctx: Context, line: lineType) => {
        ctx.beginPath();

        ctx.moveTo(line.sx, line.sy);
        ctx.lineTo(line.cx, line.cy);
        ctx.lineWidth = 1;
        ctx.strokeStyle = "white";
        ctx.stroke();
    }

    const drawPencil = (ctx: Context, pencilData: PencilShape) => {
        ctx.beginPath();
        ctx.moveTo(pencilData.sx, pencilData.sy);
        ctx.lineTo(pencilData.cx, pencilData.cy);
        ctx.lineWidth = 1;
        ctx.strokeStyle = "white";
        ctx.stroke();
        ctx.closePath();
    }


    const drawArrow = (ctx: Context, arrow: ArrowType) => {
        const headLength = 10;
        const angle = Math.atan2(arrow.cy - arrow.sy, arrow.cx - arrow.sx);

        ctx?.beginPath();
        ctx?.moveTo(arrow.sx, arrow.sy);
        ctx.lineTo(arrow.cx, arrow.cy); // Draw to the current point
        ctx.lineWidth = 1;
        ctx.strokeStyle = "white";
        ctx.stroke();

        const arrowX1 = arrow.cx - headLength * Math.cos(angle - Math.PI / 6);
        const arrowY1 = arrow.cy - headLength * Math.sin(angle - Math.PI / 6);
        const arrowX2 = arrow.cx - headLength * Math.cos(angle + Math.PI / 6);
        const arrowY2 = arrow.cy - headLength * Math.sin(angle + Math.PI / 6);

        ctx.beginPath();
        ctx.moveTo(arrow.cx, arrow.cy);
        ctx.lineTo(arrowX1, arrowY1);
        ctx.lineTo(arrowX2, arrowY2);
        ctx.closePath();
        // ctx.strokeStyle = "white"; // Arrow color
        ctx.fillStyle = "white";// Arrowhead color
        ctx.fill();
    }

    const drawText = (ctx: Context, inputData: InputType) => {
        ctx.font = "20px Arial";
        ctx.fillStyle = "white"; // Set text color
        ctx.fillText(inputData.text, inputData.cx, inputData.cy);
    }

    // console.log(rectShape)



    return (
        <>
            <div className='h-screen bg-black'>
                {/* <div className='text-white'>CanvaRoom</div> */}
                <canvas
                    ref={canvasRef}
                    width={window.innerWidth}
                    height={window.innerHeight}
                    className="bg-black"
                    onMouseDown={onMouseDown}
                    onMouseMove={onMouseMove}
                    onMouseUp={onMouseUp}
                >


                </canvas>
                <ShapeBar shape={shape} setShape={setShape} />
                {inputActive && (
                    <input
                        ref={inputRef}
                        id='textInput'
                        className='text-white'
                        type="text"
                        autoFocus
                        style={{
                            position: "absolute",
                            left: `${inputPos.x}px`,
                            top: `${inputPos.y}px`,
                            fontSize: "20px",
                            color: "white",
                            background: "transparent",
                            border: "none",
                            outline: "none"
                        }}

                        onBlur={(e) => onMouseDown(e as unknown as React.MouseEvent<HTMLCanvasElement>)}
                    />
                )}

            </div>
        </>
    )
}

export default RoomCanvas;













