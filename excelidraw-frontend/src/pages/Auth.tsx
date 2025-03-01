
import { z } from 'zod'
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BACKEND_URL } from '../config';


const signupSchema = z.object({
    name: z.string().min(1, "name is required"),
    email: z.string().min(3, "email is required and more than 3 character"),
    password: z.string().min(3, "password is required and more than 3 character")
})

type signupType = z.infer<typeof signupSchema>;

const signinSchema = z.object({
    email: z.string().email("invalid email"),
    password: z.string()
})
type signinType = z.infer<typeof signinSchema>;

export let token: string | null | undefined;


const Auth = ({ authType }: { authType: ('signup' | 'signin') }) => {
    // const signup = true;
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors } } = useForm<signupType | signinType>({
        resolver: zodResolver(authType === 'signup' ? signupSchema : signinSchema)
    });
    const submitted = async (data: (signupType | signinType)) => {
        // console.log(data);
        let response;
        let result;
        showAuth === 'signup' ? response = await axios.post(`${BACKEND_URL}/api/signup`, data) :
            response = await axios.post(`${BACKEND_URL}/api/signin`, data, { withCredentials: true });
        //@ts-ignore
        result = response.data;

        if (showAuth !== 'signup') {
            token = result.token;
            // console.log(token + ' token form sign in')
        }


        // console.log(JSON.stringify(result));


        if (!result.success) {
            return
        }

        if (showAuth === 'signup') {
            // console.log("inside signup")
            navigate('/signin')
        } else {
            // console.log("inside sigin")
            navigate('/roomoption')
        }
    }

    // const errorData = () => { console.log(JSON.stringify(errors) + " eror data.s") }

    const [showAuth, setShowAuth] = useState<'signin' | 'signup' | null>(authType);

    return (
        <>


            {showAuth && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full relative">
                        {/* <button
                            onClick={() => setShowAuth(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <X className="h-5 w-5" />
                        </button> */}
                        <h2 className="text-2xl font-bold mb-6">
                            {showAuth === 'signin' ? 'Sign In' : 'Sign Up'}
                        </h2>
                        <form onSubmit={handleSubmit(submitted)} className="space-y-4">
                            {showAuth === 'signup' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        Name
                                    </label>

                                    <input
                                        {...register('name')}
                                        type="text"
                                        className="w-full px-3 py-2 bg-gray-100 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                                        placeholder="Name"
                                    />
                                    <div className=' text-red-600'>{"name" in errors && errors.name && <p className='text-sm text-red-600'>{String(errors.name.message)}</p>}</div>

                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Email
                                </label>
                                <input
                                    {...register('email')}
                                    type="email"
                                    className="w-full px-3 py-2 bg-gray-100 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500  outline-none transition-colors"
                                    placeholder="Enter your email"
                                />
                                <div className='text-white text-red-600'>{errors.email && <p className='text-sm text-red-600'>{String(errors.email.message)}</p>}</div>

                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Password
                                </label>
                                <input
                                    {...register('password')}
                                    type="password"
                                    className="w-full px-3 py-2 bg-gray-100 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                                    placeholder="Enter your password"
                                />
                                <div className='text-white text-red-600'>{errors.password && <p className='text-sm text-red-600'>{String(errors.password.message)}</p>}</div>

                            </div>

                            <button
                                type="submit"

                                className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                            >
                                {showAuth === 'signin' ? 'Sign In' : 'Create Account'}
                            </button>
                        </form>
                        <p className="mt-4 text-center text-sm text-gray-400">
                            {showAuth === 'signin' ? (
                                <>
                                    Don't have an account?{' '}
                                    <button
                                        onClick={() => navigate('/signup')}
                                        className="text-blue-400 hover:text-blue-300"
                                    >
                                        Sign up
                                    </button>
                                </>
                            ) : (
                                <>
                                    Already have an account?{' '}
                                    <button
                                        onClick={() => navigate('/signin')}

                                        type='submit'
                                        className="text-blue-400 hover:text-blue-300"
                                    >
                                        Sign in
                                    </button>
                                </>
                            )}
                        </p>
                    </div>
                </div>
            )}
        </>
    )
}

export default Auth;