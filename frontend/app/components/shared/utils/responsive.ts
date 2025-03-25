import {
  onMounted, onUnmounted, ref
} from 'vue';

const useResponsive = () => {
  const pageWidth = ref(0);

  const updatePageWidth = () => {
    pageWidth.value = window.innerWidth;
  };

  onMounted(() => {
    updatePageWidth();
    window.addEventListener('resize', updatePageWidth);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', updatePageWidth);
  });

  return {
    pageWidth,
  };
};

export default useResponsive;
