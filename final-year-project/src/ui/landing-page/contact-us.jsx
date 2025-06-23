import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Mail, MapPin, Phone, Settings2, Sparkles, Zap } from 'lucide-react'
import { ReactNode } from 'react'

export default function ContactUs() {
  return (
    <section id='ContactUs' className="bg-zinc-50 py-16 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center">
          <h2 className="text-4xl font-semibold lg:text-5xl">Get in Touch</h2>
          <p className="mt-4 text-gray-600">
            Have questions, feedback, or need assistance? We're here to help! Choose the method that works best for you.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-sm gap-6 text-center md:mt-16 md:max-w-4xl md:grid-cols-3">
          <Card className="group shadow-md">
            <CardHeader className="pb-3">
              <CardDecorator>
                <Mail className="w-6 h-6" aria-hidden />
              </CardDecorator>
              <h3 className="mt-6 font-medium">Email</h3>
            </CardHeader>
            <CardContent>
              <a
                href="mailto:akashmoradiya3444@gmail.com"
                className="text-sm text-gray-600 hover:text-green-600 transition-colors hover:underline"
              >
                akashmoradiya3444@gmail.com
              </a>
            </CardContent>

          </Card>

          <Card className="group shadow-md">
            <CardHeader className="pb-3">
              <CardDecorator>
                <MapPin className="w-6 h-6" aria-hidden />
              </CardDecorator>
              <h3 className="mt-6 font-medium">Location</h3>
            </CardHeader>
            <CardContent>
              <a
                href="https://www.google.com/maps/search/?api=1&query=100+Smith+Street+Collingwood+VIC+3066+AU"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-600 hover:text-green-600 transition-colors hover:underline"
              >
                100 Smith Street Collingwood VIC 3066 AU
              </a>
            </CardContent>

          </Card>

          <Card className="group shadow-md">
            <CardHeader className="pb-3">
              <CardDecorator>
                <Phone className="w-6 h-6" aria-hidden />
              </CardDecorator>
              <h3 className="mt-6 font-medium">Phone</h3>
            </CardHeader>
            <CardContent>
              <a
                href="tel:+233538123456"
                className="text-sm text-gray-600 hover:text-green-600 transition-colors hover:underline"
              >
                +233 (0) 538 123 456
              </a>
            </CardContent>

          </Card>
        </div>
      </div>
    </section>
  )
}

const CardDecorator = ({ children }) => (
  <div className="relative mx-auto mb-2 h-16 w-16 rounded-full border border-gray-300 bg-white flex items-center justify-center">
    {children}
  </div>
)
