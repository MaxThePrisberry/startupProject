import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
	server: {
		proxy: {
			'/auth': 'http://localhost:4000',
			'/ws': {
				target: 'http://localhost:4000',
				ws: true,
			},
			'/api': 'http://localhost:4000',
			'/lb': 'http://localhost:4000',
		},
	},
	plugins: [react()],
})
