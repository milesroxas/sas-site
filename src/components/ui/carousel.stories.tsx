import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Card, CardContent } from './card'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './carousel'

const meta = {
  title: 'UI/Carousel',
  component: Carousel,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Carousel>

export default meta

type Story = StoryObj<typeof meta>

const slides = Array.from({ length: 5 }, (_, i) => i + 1)

export const Default: Story = {
  render: () => (
    <Carousel className="w-full max-w-xs">
      <CarouselContent>
        {slides.map((slide) => (
          <CarouselItem key={slide}>
            <Card>
              <CardContent className="flex aspect-square items-center justify-center p-6">
                <span className="text-4xl font-semibold">{slide}</span>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
}

export const MultipleSlides: Story = {
  render: () => (
    <Carousel opts={{ align: 'start' }} className="w-full max-w-sm">
      <CarouselContent>
        {slides.map((slide) => (
          <CarouselItem key={slide} className="basis-1/3">
            <Card>
              <CardContent className="flex aspect-square items-center justify-center p-6">
                <span className="text-2xl font-semibold">{slide}</span>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
}

export const Vertical: Story = {
  render: () => (
    <Carousel orientation="vertical" className="w-full max-w-xs">
      <CarouselContent className="h-48">
        {slides.map((slide) => (
          <CarouselItem key={slide}>
            <Card>
              <CardContent className="flex h-40 items-center justify-center p-6">
                <span className="text-3xl font-semibold">{slide}</span>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
}
