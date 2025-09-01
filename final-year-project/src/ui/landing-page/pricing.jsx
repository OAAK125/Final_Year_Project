import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Check } from 'lucide-react'

export default function Pricing() {
    return (
        <section id='Pricing' className="py-16 md:py-32">
            <div className="mx-auto max-w-6xl px-6">
                <div className="mx-auto max-w-2xl space-y-6 text-center">
                    <h1 className="text-center text-4xl font-semibold lg:text-5xl">Pricing that Scales with You</h1>
                    <p>Choose a plan that fits your certification journey — from first-time learners to professionals pursuing certifications.</p>
                </div>

                <div className="mt-8 grid gap-6 md:mt-20 md:grid-cols-3">
                    {/* Free Plan */}
                    <Card className="flex flex-col">
                        <CardHeader>
                            <CardTitle className="font-medium">Free</CardTitle>
                            <span className="my-3 block text-2xl font-semibold">$0 / mo</span>
                            <CardDescription className="text-sm">Per user</CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <hr className="border-dashed" />

                            <ul className="list-outside space-y-3 text-sm">
                                {[
                                    '1 Trial Practice Test per Certification',
                                    'Access to Free Credited Resources (view only)',
                                    'Basic Progress Tracking',
                                    'Community Ratings on Questions'
                                ].map((item, index) => (
                                    <li
                                        key={index}
                                        className="flex items-center gap-2">
                                        <Check className="size-3" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Standard Plan */}
                    <Card className="relative">
                        <span className="bg-linear-to-br/increasing absolute inset-x-0 -top-3 mx-auto flex h-6 w-fit items-center rounded-full from-purple-400 to-amber-300 px-3 py-1 text-xs font-medium text-amber-950 ring-1 ring-inset ring-white/20 ring-offset-1 ring-offset-gray-950/5">Popular</span>

                        <div className="flex flex-col">
                            <CardHeader>
                                <CardTitle className="font-medium">Standard</CardTitle>
                                <span className="my-3 block text-2xl font-semibold">$15 / mo</span>
                                <CardDescription className="text-sm">Per user</CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                <hr className="border-dashed mt-6" />
                                <ul className="list-outside space-y-3 text-sm">
                                    {[
                                        'Everything from Free, plus:',
                                        'Full Access to 1 Chosen Certification',
                                        'Unlimited Practice Tests for that Cert',
                                        'Downloadable Resources for that Cert',
                                        'Question Flagging for Review',
                                        'Email & Chat Support'
                                    ].map((item, index) => (
                                        <li
                                            key={index}
                                            className="flex items-center gap-2">
                                            <Check className="size-3" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </div>
                    </Card>

                    {/* All-Access Plan */}
                    <Card className="flex flex-col">
                        <CardHeader>
                            <CardTitle className="font-medium">All-Access</CardTitle>
                            <span className="my-3 block text-2xl font-semibold">$40 / mo</span>
                            <CardDescription className="text-sm">Per user</CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <hr className="border-dashed" />

                            <ul className="list-outside space-y-3 text-sm">
                                {[
                                    'Everything from Standard, plus:',
                                    'Access to All Certifications',
                                    'Unlimited Practice Tests Across All Certs',
                                    'All Downloadable Resources',
                                    'Question Flagging for Review',
                                    'Custom Quiz Builder',
                                    'Priority Support'
                                ].map((item, index) => (
                                    <li
                                        key={index}
                                        className="flex items-center gap-2">
                                        <Check className="size-3" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    )
}
