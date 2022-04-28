import React from 'react'
import {withJaenMock} from '@jaenjs/jaen'
import {ComponentStory, ComponentMeta} from '@storybook/react'

import {HomeTemplate} from '../HomeTemplate'
// import {ScrollToTopButtonProps} from '../../../molecules/buttons/ScrollToTopButton'
// import {SideButtonsProps} from '../../../molecules/buttons/SideButtons'
// import {ScrollSpyProps} from '../../../molecules/ScrollSpy'
import {
  AboutSectionProps,
  FAQSectionProps,
  HeroSectionProps,
  ReviewSectionProps,
  FeaturedProductsSectionProps,
} from '../../../organisms/sections'
// import * as ScrollSpyStories from '../../../molecules/ScrollSpy/stories/ScrollSpy.stories'
// import * as ScrollToTopStories from '../../../molecules/buttons/ScrollToTopButton/stories/ScrollToTopButton.stories'
// import * as SideButtonsStories from '../../../molecules/buttons/SideButtons/stories/SideButtons.stories'
import * as AboutSectionStories from '../../../organisms/sections/AboutSection/stories/AboutSection.stories'
import * as FAQSectionStories from '../../../organisms/sections/FAQSection/stories/FAQSection.stories'
import * as HeroSectionStories from '../../../organisms/sections/HeroSection/stories/HeroSection.stories'
import * as FeaturedProductsSectionStories from '../../../organisms/sections/FeaturedProductsSection/stories/FeaturedProductsSection.stories'
import * as ReviewSectionStories from '../../../organisms/sections/ReviewSection/stories/ReviewSection.stories'

import {jaenPage as jaenPageAbout} from '../../../organisms/sections/AboutSection/stories/jaen-data'
import {jaenPage as jaenPageFAQ} from '../../../organisms/sections/FAQSection/stories/jaen-data'

export default {
  title: 'Components/Templates/HomeTemplate',
  component: HomeTemplate,
  decorators: [
    Story => {
      const MockedStory = withJaenMock(Story, {jaenPage: {...jaenPageAbout, ...jaenPageFAQ, chapters: {...jaenPageAbout.chapters, ...jaenPageFAQ.chapters} }})
      return(
        <MockedStory/>
      )
    }
  ]
} as ComponentMeta<typeof HomeTemplate>

const aboutSectionArgs = AboutSectionStories.Default.args as AboutSectionProps
const faqSectionArgs = FAQSectionStories.Default.args as FAQSectionProps
const heroSectionArgs = HeroSectionStories.Default.args as HeroSectionProps
const featuredProductsSectionArgs = FeaturedProductsSectionStories.Default
  .args as FeaturedProductsSectionProps
const reviewSectionArgs = ReviewSectionStories.Default.args as ReviewSectionProps
// const scrollToTopButtonArgs = ScrollToTopStories.Default.args as ScrollToTopButtonProps
// const sideButtonsArgs = SideButtonsStories.Default.args as SideButtonsProps
// const scrollSpyArgs = ScrollSpyStories.Default.args as ScrollSpyProps

const Template: ComponentStory<typeof HomeTemplate> = args => (
  <HomeTemplate {...args} />
)

export const Default = Template.bind({})
Default.args = {
  aboutSection: aboutSectionArgs,
  faqSection: faqSectionArgs,
  heroSection: heroSectionArgs,
  featuredProductsSection: featuredProductsSectionArgs,
  reviewSection: reviewSectionArgs,
  // sideButtons: sideButtonsArgs,
  // scrollToTopButton: scrollToTopButtonArgs,
  // scrollSpy: scrollSpyArgs
}
