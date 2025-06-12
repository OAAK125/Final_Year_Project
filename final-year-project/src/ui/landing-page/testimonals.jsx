import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function TestimonialsSection() {
    return (
        <section className="py-16 md:py-32">
            <div className="mx-auto max-w-5xl px-6">
                <div className="mx-auto max-w-2xl text-center">
                    <blockquote>
                        <p className="text-lg font-medium sm:text-xl md:text-3xl">
                            This platform is a game-changer; the detailed explanations and the active forum answered every question I had, 
                            making my CompTIA Security+ journey so much smoother.
                        </p>

                        <div className="mt-12 flex items-center justify-center gap-6">
                            <Avatar className="h-12 w-12">
                                <AvatarImage
                                    src="/assets/images/img-avatar.png"
                                    alt="A profile picture of John Doe"
                                    height="400"
                                    width="400"
                                    loading="lazy"
                                />
                                <AvatarFallback>JD</AvatarFallback>
                            </Avatar>

                            <div className="border-l pl-6">
                                <cite className="block font-medium">John Doe</cite>
                                <span className="block text-sm text-gray-500 dark:text-gray-400">
                                    Aspiring Cybersecurity Pro
                                </span>
                            </div>
                        </div>
                    </blockquote>
                </div>
            </div>
        </section>
    )
}
