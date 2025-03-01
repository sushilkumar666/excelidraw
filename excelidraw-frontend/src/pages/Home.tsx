import React from 'react';
import { Pencil, Share2, Users, Lock, Github, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Home() {

    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
            {/* Navigation */}
            <nav className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Pencil className="h-6 w-6 text-blue-400" />
                        <span className="text-xl font-bold">Excelidraw</span>
                    </div>
                    {/* <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setShowAuth('signin')}
                            className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                        >
                            Log in
                        </button>
                        <button
                            onClick={() => setShowAuth('signup')}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            Sign up
                        </button>
                    </div> */}
                </div>
            </nav>



            {/* Hero Section */}
            <main className="container mx-auto px-6 pt-16 pb-24">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-5xl font-bold mb-6">
                        Collaborate and Create Beautiful Diagrams
                    </h1>
                    <p className="text-xl text-gray-300 mb-10">
                        The whiteboard tool that lets you sketch, collaborate, and share your ideas in real-time.
                    </p>
                    <div className="flex justify-center space-x-4">
                        <button onClick={() => navigate('/signin')} className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center">

                            Log in
                        </button>
                        <button onClick={() => navigate('/signup')} className="px-8 py-3 border border-gray-600 text-gray-300 rounded-lg hover:border-gray-500 hover:text-white transition-colors flex items-center">

                            Sign up
                        </button>
                    </div>
                </div>

                {/* Features */}
                <div className="grid md:grid-cols-3 gap-12 mt-24">
                    <div className="text-center">
                        <div className="bg-gray-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Share2 className="h-8 w-8 text-blue-400" />
                        </div>
                        <h3 className="text-xl font-semibold mb-4">Real-time Collaboration</h3>
                        <p className="text-gray-300">Work together with your team in real-time, no matter where they are.</p>
                    </div>
                    <div className="text-center">
                        <div className="bg-gray-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Users className="h-8 w-8 text-blue-400" />
                        </div>
                        <h3 className="text-xl font-semibold mb-4">Team Friendly</h3>
                        <p className="text-gray-300">Perfect for teams of all sizes. Share and manage access easily.</p>
                    </div>
                    <div className="text-center">
                        <div className="bg-gray-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Lock className="h-8 w-8 text-blue-400" />
                        </div>
                        <h3 className="text-xl font-semibold mb-4">Secure by Default</h3>
                        <p className="text-gray-300">Your data is encrypted and secure. You're in control of your privacy.</p>
                    </div>
                </div>

                {/* Preview Image */}


            </main >
        </div >
    );
}

export default Home;