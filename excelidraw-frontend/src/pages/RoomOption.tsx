import { useState } from "react";
import { Pencil, X } from "lucide-react";
import { useForm } from 'react-hook-form'
import axios from "axios";
import { BACKEND_URL } from "../config";
import { useNavigate } from "react-router-dom";
import slugify from "slugify";


function RoomOption() {
    const [showAuth, setShowAuth] = useState<boolean>(false);
    const [joinRoom, setJoinRoom] = useState<boolean>(false);
    const [joinRoomNotExists, setJoinRoomNotExists] = useState<boolean>(false);
    const [createRoomExists, setCreateRoomExists] = useState<boolean>(false);
    const { register, handleSubmit, clearErrors, setError, formState: { errors } } = useForm();

    const navigate = useNavigate();

    const joinRoomClicked = () => {
        console.log("joinedRoomClicked");
        setShowAuth(true);
        setJoinRoom(true);
    }

    const createRoomClicked = () => {
        console.log("createRoomClicked");
        setJoinRoom(false);
        setShowAuth(true);
    }

    const onSubmit = async (data: any) => {
        console.log(data);
        const roomexists = await axios.post(BACKEND_URL + '/api/roomexists', data);
        console.log(roomexists);
        let slug = roomexists.data.data
        console.log("check 1")
        if (joinRoom) {
            console.log("check 2")
            if (roomexists.data.success) {
                console.log("111 i am navigating")
                navigate(`/room/${slug}`)
            }
            else {
                setJoinRoomNotExists(true)
                // setError("roomnotexists", { type: "manual", message: "room doesn't exists" });
            }

        } else {
            console.log("check 3")
            if (roomexists.data.success) {
                setCreateRoomExists(true)
                // console.log("i am insdie test ")
                // setError("roomexists", { type: "manual", message: "room already exists" });
            } else {
                // slug = slugify(data.slug, { lower: true });
                const newRoom = await axios.post(BACKEND_URL + '/api/createroom', data, { withCredentials: true });

                console.log(newRoom)
                if (newRoom.data.success) {
                    console.log("222 i am navigating")
                    navigate(`/room/${slug}`)
                } else {
                    console.log("room doesnot created");
                }
            }
        }
        // roomexists.data.success and roomexists.data.data 
    }



    return (
        <>

            {showAuth && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full relative">
                        <button
                            onClick={() => setShowAuth(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                            {showAuth && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        <p>Room name</p>
                                    </label>
                                    <input
                                        {...register('slug', { required: 'Room is required' })}
                                        type="text"
                                        onChange={() => clearErrors("slug")}
                                        className="w-full px-3 text-white py-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                                        placeholder="Room name"
                                    />
                                    {errors.slug && <p className="text-sm text-red-500">{errors.slug.message as string}</p>}
                                    {/* {errors.roomexists && <p className="text-sm text-red-500">{errors.roomexists.message as string}</p>}
                                    {errors.roomnotexists && <p className="text-sm text-red-500">{errors.roomnotexists.message as string}</p>} */}
                                    {joinRoomNotExists && <p className="text-sm text-red-500">Room not exists </p>}
                                    {createRoomExists && <p className="text-sm text-red-500">Room already exists </p>}



                                </div>
                            )}
                            <button
                                type="submit"
                                className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                            >
                                {joinRoom ? 'Join Room' : 'Create Room'}
                            </button>
                        </form>

                    </div>
                </div>
            )}

            <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex justify-cneter items-center">

                <div className='flex flex-col items-center justify-center mx-auto'>
                    <div onClick={joinRoomClicked} className="px-8 py-3 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 transition-colors w-40 justify-center flex items-center">Join Room</div><br />
                    <div onClick={createRoomClicked} className="px-8 py-3 border border-gray-600 text-gray-300 cursor-pointer rounded-lg hover:border-gray-500 w-40  justify-center hover:text-white transition-colors flex items-center">Create Room</div>
                </div>
            </div>
        </>
    )

}

export default RoomOption