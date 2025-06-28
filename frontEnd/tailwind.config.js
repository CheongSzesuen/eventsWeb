// frontEnd/tailwind.config.js
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        // 新增按钮状态色
        state: {
          active: 'rgba(209, 213, 219, 0.5)',
          darkActive: 'rgba(75, 85, 99, 0.5)'
        }
      },
      // 扩展动画配置
      transitionProperty: {
        'button': 'background-color, transform, box-shadow',
        'sidebar': 'transform, opacity'
      },
      // 扩展持续时间
      transitionDuration: {
        '200': '200ms',
        '300': '300ms'
      },
      // 扩展断点
      screens: {
        'tablet': {'min': '640px', 'max': '1024px'},
        'desktop': '1025px'
      }
    },
  },
  plugins: [
    // 添加表单插件
    require('@tailwindcss/forms')({
      strategy: 'class' // 仅生成类名样式
    })
  ],
}