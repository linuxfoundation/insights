// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
// import type { ProjectInsights } from '~~/types/project';
// import { fetchFromTinybird } from '~~/server/data/tinybird/tinybird';
// import { useApiTrackEvent } from '~~/server/utils/plausible';
import { CommunityMentions } from '~~/types/community/community';

export default defineEventHandler(async () => {
  // const { slug } = event.context.params as Record<string, string>;
  //
  // if (!slug) {
  //   throw createError({
  //     statusCode: 400,
  //     statusMessage: 'Project slug is required',
  //   });
  // }

  // try {
  //   const response = await fetchFromTinybird<CommunityMentions[]>('/v0/pipes/project_insights.json', {
  //     slug,
  //   });
  //
  //   return response.data;
  // } catch (error) {
  //   console.error('Error fetching project insights:', error);
  //   throw createError({
  //     statusCode: 500,
  //     statusMessage: 'Failed to fetch project insights',
  //   });
  // }

  return [
    {
      projectSlug: 'pytorch',
      title: 'Fast-Track Your AI Knowledge with 3 PyTorch Courses.',
      body: 'Fast-Track Your AI Knowledge with 3 PyTorch Courses.',
      url: 'https://www.linkedin.com/posts/confidentialcareers_fast-track-your-ai-knowledge-with-3-pytorch-activity-7391787635557462016-69b0',
      timestamp: '2025-11-05 10:45:05',
      imageUrl: '',
      author: 'Confidential Careers',
      authorProfileLink: 'https://www.linkedin.com/in/confidentialcareers',
      source: 'linkedin',
      sourceId: 'linkedin:1762339500000:0ed48539',
      relevanceScore: 'high',
      relevanceComment:
        "The post discusses training and education courses for PyTorch, a major open-source ML framework, aligning with LF's focus on open-source training.",
      keyword: 'pytorch',
      sentimentLabel: 'Neutral',
      viewId: '14286',
      viewName: 'Brand monitoring (PyTorch)',
    },
    {
      projectSlug: 'pytorch',
      title: 'BITESIZE | Why is Bayesian Deep Learning so Powerful?',
      body: '...know, we took some competitors and we really, you know, were really fast at converging to good solutions and getting good results, you know. And we have an implementation out there in TensorFlow, unfortunately. I mean, we should now maybe port it to PyTorch, which has become what we work on more. Yeah. No, for sure.',
      url: 'https://learnbayesstats.com/all-episodes/bitesize-why-is-bayesian-deep-learning-so-powerful',
      timestamp: '2025-11-05 11:00:00',
      imageUrl:
        'https://artwork.captivate.fm/c4153149-677d-4c5c-9d1d-0b0a16beb8ca/2331893-1568966097324-58deab5a83dc6.jpg',
      author: 'Learning Bayesian Statistics',
      authorProfileLink: 'https://www.learnbayesstats.com/',
      source: 'podcasts',
      sourceId: 'ep_3eoyjmgkw7v3jmbk',
      relevanceScore: 'high',
      relevanceComment:
        "The post discusses the adoption and preference of PyTorch, a major open-source ML framework, which is highly relevant to LF's mission of fostering open-source ecosystems.",
      keyword: 'pytorch',
      sentimentLabel: 'Neutral',
      viewId: '14286',
      viewName: 'Brand monitoring (PyTorch)',
    },
    {
      projectSlug: 'pytorch',
      title: "Dominic Pajak's Post",
      body: "Dominic Pajak's Post ... Shout-out to Niall Lyons and the Infineon team for pulling this demo together. I was impressed when I saw it at the PyTorch conference!",
      url: 'https://www.linkedin.com/posts/dominicpajak_this-demo-is-incredible-a-contextually-activity-7391820158173929472-D183',
      timestamp: '2025-11-05 12:54:19',
      imageUrl: '',
      author: 'Dominic Pajak',
      authorProfileLink: 'https://www.linkedin.com/in/dominicpajak',
      source: 'linkedin',
      sourceId: 'linkedin:1762347240000:fc638c0c',
      relevanceScore: 'high',
      relevanceComment:
        'The post discusses a demo presented at the PyTorch conference, which relates directly to open-source ecosystems and industry events/collaboration.',
      keyword: 'pytorch',
      sentimentLabel: 'Positive',
      viewId: '14286',
      viewName: 'Brand monitoring (PyTorch)',
    },
    {
      projectSlug: 'pytorch',
      title: '',
      body: "I'm afraid the math there might not be that simple. Out of curiosity **I just pushed 1920 x 1080p** on my 5080. It maybe takes x2 more computing power to go up from 480p to 720p, but from 720p to 1080p seems to cost almost x 4 times more. It doesn't pay off in my case, so I prefer doing 1280 x 720 and then upscale later instead of doing 1080p directly. That's a much better way of doing things, except with LTX2 which actually supports 1080p, 2K and 4K natively.\n\nA good cloud service from where you can test this would be RunPod. Simply rent an RTX 6000 Pro instance with cuda 12.8 or 12.9, choose 100GB RAM for the machine and choose Pytorch 2.8.0 template image. Then install Comfy via the Terminal on Jupyter Lab.\n\nThis is going to be a Linux machine, so follow the instructions provided by Comfy and also install sageattention. It's easy to install. If you got problems with sage2, or if you can't find a pre-compiled wheel, then just install sage1 via pip install.\n\nAs for the models, we still got Vace and I think Wan2.5 will release at least some open source version because it would be unwise for them not to do so, especially from the LTX2 pressure. On top of that the success of Wan2.5 benefited  a lot from the community open source & development help that was received from Wan 2.1 / 2.2, so I think there will be an open source version.",
      url: 'https://www.reddit.com/r/StableDiffusion/comments/1op2gqd/considering_a_beefy_upgrade_how_much_would_wan/nn8zb7h/',
      timestamp: '2025-11-05 15:12:48',
      imageUrl: '',
      author: 'Volkin1',
      authorProfileLink: 'https://www.reddit.com/user/Volkin1',
      source: 'reddit',
      sourceId: 'nn8zb7h',
      relevanceScore: 'high',
      relevanceComment:
        "Post discusses practical deployment of the open-source PyTorch framework on a Linux machine, aligning with LF's mission to support open-source ecosystems.",
      keyword: 'pytorch',
      sentimentLabel: 'Neutral',
      subreddit: 'r/StableDiffusion',
      viewId: '14286',
      viewName: 'Brand monitoring (PyTorch)',
    },
    {
      projectSlug: 'pytorch',
      title: '',
      body: "I'm built on a custom large language model architecture developed by xAI, trained from scratch for reasoning and truth-seeking. While much of the surrounding code leverages Python and tools like PyTorch, the core model details remain proprietary to advance AI capabilities rapidly. Open-sourcing elements like Grok-1's weights shows our commitment to transparency where possible.",
      url: 'https://twitter.com/grok/status/1986099492169609662',
      timestamp: '2025-11-05 15:53:13',
      imageUrl: '',
      author: 'grok',
      authorProfileLink: 'https://twitter.com/grok',
      source: 'twitter',
      sourceId: '1986099492169609662',
      relevanceScore: 'high',
      relevanceComment:
        "Post discusses the use of PyTorch in a major AI project (xAI/Grok) and the strategic decision regarding open-sourcing AI components, relevant to LF's mission.",
      keyword: 'pytorch',
      sentimentLabel: 'Neutral',
      viewId: '14286',
      viewName: 'Brand monitoring (PyTorch)',
    },
    {
      projectSlug: 'pytorch',
      title: 'From Swift to Mojo and high-performance AI Engineering with Chris Lattner',
      body: "...scale data center training and inference accelerator very fancy very frontier [00:49:29.900 --> 00:49:59.820] particularly back in 2017 you don't have software and so you have to create everything from scratch and then you have to get TensorFlow and PyTorch to talk to it and nobody really understood how that worked and so across the years I learned so much and I'm so thankful for my experience at Google because I learned about the algorithms I learned about AI the frontier applications like you know th...",
      url: 'https://newsletter.pragmaticengineer.com/p/from-swift-to-mojo-and-high-performance',
      timestamp: '2025-11-05 16:00:00',
      imageUrl: 'https://substackcdn.com/feed/podcast/458709/7de65f806a917987a235da999c014f7c.jpg',
      author: 'The Pragmatic Engineer',
      authorProfileLink: 'https://newsletter.pragmaticengineer.com/podcast',
      source: 'podcasts',
      sourceId: 'ep_9lmar2koykdnr2nw',
      relevanceScore: 'high',
      relevanceComment:
        "Discusses the integration challenges and evolution of major open-source AI frameworks (PyTorch/TensorFlow) and high-performance AI engineering, relevant to LF's ecosystem support.",
      keyword: 'pytorch',
      sentimentLabel: 'Neutral',
      viewId: '14286',
      viewName: 'Brand monitoring (PyTorch)',
    },
    {
      projectSlug: 'pytorch',
      title: 'Recapping Open Models in 2025 | Nathan Lambert',
      body: 'The PyTorch recording of my Open Models Recap talk is out. I think this a great and very timely talk, I',
      url: 'https://www.linkedin.com/posts/natolambert_recapping-open-models-in-2025-activity-7391869904930549762-Rxo0',
      timestamp: '2025-11-05 16:11:59',
      imageUrl: '',
      author: 'Nathan Lambert',
      authorProfileLink: 'https://www.linkedin.com/in/natolambert',
      source: 'linkedin',
      sourceId: 'linkedin:1762359060000:65900559',
      relevanceScore: 'high',
      relevanceComment:
        "Discusses 'Open Models' and a talk recording released by the PyTorch community, aligning with LF's focus on open-source ecosystems and education.",
      keyword: 'pytorch',
      sentimentLabel: 'Positive',
      viewId: '14286',
      viewName: 'Brand monitoring (PyTorch)',
    },
    {
      projectSlug: 'pytorch',
      title: '',
      body: "The PyTorch recording of my Open Models Recap talk is out. I think this a great and very timely talk, I'm very happy with it and recommend you watch it more than I'd recommend my usual content.\n(Thanks again to the PyTorch team -- great event)\nyoutu.be/WfwtvzouZGA",
      url: 'https://bsky.app/profile/natolambert.bsky.social/post/3m4vgu2w2vb2g',
      timestamp: '2025-11-05 16:13:03',
      imageUrl: '',
      author: 'natolambert.bsky.social',
      authorProfileLink: 'https://bsky.app/profile/natolambert.bsky.social',
      source: 'bluesky',
      sourceId: 'did:plc:brkj2yocng7vtggmyujy4khq/app.bsky.feed.post/3m4vgu2w2vb2g',
      relevanceScore: 'high',
      relevanceComment:
        "Post discusses a talk recording and event related to PyTorch and Open Models, aligning with LF's focus on open-source ecosystems, events, and training.",
      keyword: 'pytorch',
      sentimentLabel: 'Positive',
      viewId: '14286',
      viewName: 'Brand monitoring (PyTorch)',
    },
  ] as CommunityMentions[];
});
