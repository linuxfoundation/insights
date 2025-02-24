import {
 computed, onMounted, onUnmounted, ref
} from 'vue';

const useScroll = () => {
  const scrollTop = ref(0);
  const scrollTopPercentage = computed(() => (scrollTop.value / (body?.scrollHeight || 1)) * 100);
  let body = document?.querySelector('body');

  const updateScrollTop = () => {
    scrollTop.value = body?.scrollTop || 0;
  };

  const scrollToTop = (value: number = 0) => {
    document.body.scrollTo({
      top: value,
      behavior: 'smooth'
    });
  };

  const scrollToTarget = (element: HTMLElement, headerOffset: number = 220) => {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + document.body.scrollTop - headerOffset;

    scrollToTop(offsetPosition);
  };

  onMounted(() => {
    body = document?.querySelector('body');
    body?.addEventListener('scroll', updateScrollTop);
    updateScrollTop();
  });

  onUnmounted(() => {
    window.removeEventListener('scroll', updateScrollTop);
  });

  return {
    scrollTop,
    scrollTopPercentage,
    scrollToTarget,
    scrollToTop
  };
};

export default useScroll;
