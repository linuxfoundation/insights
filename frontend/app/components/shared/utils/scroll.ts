import {
 computed, onMounted, onUnmounted, ref
} from 'vue';

const useScroll = () => {
  const scrollTop = ref(0);
  let body = document?.querySelector('body');
  const scrollTopPercentage = computed(() => {
    const scrollHeight = body?.scrollHeight || 1;
    const clientHeight = body?.clientHeight || 0;
    return (scrollTop.value / (scrollHeight - clientHeight)) * 100;
  });

  const updateScrollTop = () => {
    scrollTop.value = body?.scrollTop || 0;
  };

  const scrollToTop = (value: number = 0, behavior: 'smooth' | 'instant' = 'smooth') => {
    document.body.scrollTo({
      top: value,
      behavior
    });
  };

  const scrollToTarget = (
    element: HTMLElement,
    headerOffset: number = 220,
    behavior: 'smooth' | 'instant' = 'smooth'
  ) => {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + document.body.scrollTop - headerOffset;

    scrollToTop(offsetPosition, behavior);
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
