/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      backgroundColor: {
        'column-grey': '#9c9a9a',  // por ejemplo, un color gris para la columna ID
        // ... otros colores personalizados
      }
    },
  },
  plugins: [],
}

