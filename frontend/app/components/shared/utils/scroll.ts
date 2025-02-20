import { onMounted, onUnmounted, ref } from 'vue';

const useScroll = () => {
  const scrollTop = ref(0);
  let body = document?.querySelector('body');

  const updateScrollTop = () => {
    scrollTop.value = body?.scrollTop || 0;
  };

  onMounted(() => {
    body = document?.querySelector('body');
    body?.addEventListener('scroll', updateScrollTop);
    updateScrollTop();
  });

  onUnmounted(() => {
    window.removeEventListener('scroll', updateScrollTop);
  });

  //   const addObserver = (element: HTMLElement) => {
  //     if (observer) {
  //       observer.observe(element);
  //     }
  //   };

  //   const removeObserver = (element: HTMLElement) => {
  //     if (observer) {
  //       observer.unobserve(element);
  //     }
  //   };

  return {
    scrollTop
  };
};

export default useScroll;
