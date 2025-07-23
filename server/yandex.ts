// Yandex APIs integration
import { YANDEX_MAPS_API_KEY } from './secrets';

export interface YandexConfig {
  mapsApiKey?: string;
  metricsCounterId?: string;
}

export class YandexIntegration {
  private config: YandexConfig;

  constructor(config: YandexConfig) {
    this.config = config;
  }

  // Yandex Maps configuration
  getMapConfig() {
    const apiKey = YANDEX_MAPS_API_KEY;
    return {
      apiKey: apiKey,
      center: [55.751244, 37.618423], // Default to Moscow
      zoom: 10,
      controls: ['zoomControl', 'fullscreenControl']
    };
  }

  // Yandex Metrica configuration
  getMetricaConfig() {
    return {
      id: this.config.metricsCounterId,
      clickmap: true,
      trackLinks: true,
      accurateTrackBounce: true,
      webvisor: true
    };
  }

  // Generate Yandex Maps embed URL
  generateMapEmbedUrl(address: string): string {
    const encodedAddress = encodeURIComponent(address);
    return `https://yandex.ru/map-widget/v1/?text=${encodedAddress}&z=16`;
  }

  // Generate Metrica script
  generateMetricaScript(): string {
    if (!this.config.metricsCounterId) return '';
    
    return `
      (function(m,e,t,r,i,k,a){
        m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
        m[i].l=1*new Date();
        k=e.createElement(t),a=e.getElementsByTagName(t)[0],
        k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
      })(window, document, "script", "https://mc.yandex.ru/metrika/watch.js", "ym");
      
      ym(${this.config.metricsCounterId}, "init", {
        clickmap:true,
        trackLinks:true,
        accurateTrackBounce:true,
        webvisor:true
      });
    `;
  }
}

// Initialize with environment variables
export const yandexIntegration = new YandexIntegration({
  mapsApiKey: YANDEX_MAPS_API_KEY,
  metricsCounterId: process.env.YANDEX_METRICS_COUNTER_ID
});

// Middleware to inject Yandex scripts
export function injectYandexScripts(req: any, res: any, next: any) {
  const originalSend = res.send;
  
  res.send = function(data: any) {
    if (typeof data === 'string' && data.includes('</head>')) {
      // Inject Yandex Metrica
      const metricaScript = yandexIntegration.generateMetricaScript();
      if (metricaScript) {
        data = data.replace('</head>', `
          <script type="text/javascript">
            ${metricaScript}
          </script>
          <noscript>
            <div><img src="https://mc.yandex.ru/watch/${process.env.YANDEX_METRICS_COUNTER_ID}" style="position:absolute; left:-9999px;" alt="" /></div>
          </noscript>
          </head>
        `);
      }
    }
    
    originalSend.call(this, data);
  };
  
  next();
}