import React, { useState, useCallback } from 'react';

const Tooltip = React.memo(({ text, bgClass }) => {
  // Extract gradient colors for the tooltip based on the social platform
  const getTooltipClasses = (bgClass) => {
    if (bgClass.includes('purple-600') && bgClass.includes('pink-600')) {
      // Instagram gradient
      return {
        bg: 'bg-gradient-to-br from-purple-600 via-pink-600 to-yellow-500',
        arrow: 'border-l-purple-600'
      };
    } else if (bgClass.includes('gray-600')) {
      // Email
      return {
        bg: 'bg-gray-600',
        arrow: 'border-l-gray-600'
      };
    } else if (bgClass.includes('yellow-400')) {
      // Snapchat
      return {
        bg: 'bg-yellow-500 text-black',
        arrow: 'border-l-yellow-400'
      };
    } else if (bgClass.includes('green-500')) {
      // WhatsApp
      return {
        bg: 'bg-green-500',
        arrow: 'border-l-green-500'
      };
    }
    return {
      bg: 'bg-gray-800',
      arrow: 'border-l-gray-800'
    };
  };

  const tooltipStyles = getTooltipClasses(bgClass);

  return (
    <div className={`absolute right-full mr-4 top-1/2 -translate-y-1/2 w-max ${tooltipStyles.bg} text-white text-sm font-semibold py-2 px-4 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300 pointer-events-none whitespace-nowrap`}>
      {text}
      <div className={`absolute left-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-4 ${tooltipStyles.arrow}`}></div>
    </div>
  );
});

const SocialMediaWidget = () => {
  const [socialExpanded, setSocialExpanded] = useState(false);

  const toggleSocial = useCallback(() => {
    setSocialExpanded(prev => !prev);
  }, []);

  const socialLinks = [
    { 
      name: 'Instagram', 
      href: 'https://www.instagram.com/leksy.cosmetics?igsh=MWR5OWtpNG44ZHR2Mw==', 
      tooltip: 'Follow our journey & get daily beauty tips!',
      delay: '150ms',
      bgClass: 'bg-gradient-to-br from-purple-600 via-pink-600 to-yellow-500 hover:from-purple-700 hover:via-pink-700 hover:to-yellow-600',
      icon: <path fill="currentColor" d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9zm0 2a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM17.5 6.25a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5z"/>
    },
    { 
      name: 'Email', 
      href: 'mailto:hello@beauty.com', 
      tooltip: 'Drop us a line for support or inquiries.',
      delay: '200ms',
      bgClass: 'bg-gray-600 hover:bg-gray-700',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    },
    { 
      name: 'Snapchat', 
      href: 'https://snapchat.com/t/dqHNOMmX', 
      tooltip: 'Go behind the scenes with us!',
      delay: '250ms',
      bgClass: 'bg-yellow-400 hover:bg-yellow-500',
      icon: <path d="M15.943 11.526c-.111-.303-.323-.465-.564-.599a1 1 0 0 0-.123-.064l-.219-.111c-.752-.399-1.339-.902-1.746-1.498a3.4 3.4 0 0 1-.3-.531c-.034-.1-.032-.156-.008-.207a.3.3 0 0 1 .097-.1c.129-.086.262-.173.352-.231.162-.104.289-.187.371-.245.309-.216.525-.446.66-.702a1.4 1.4 0 0 0 .069-1.16c-.205-.538-.713-.872-1.329-.872a1.8 1.8 0 0 0-.487.065c.006-.368-.002-.757-.035-1.139-.116-1.344-.587-2.048-1.077-2.61a4.3 4.3 0 0 0-1.095-.881C9.764.216 8.92 0 7.999 0s-1.76.216-2.505.641c-.412.232-.782.53-1.097.883-.49.562-.96 1.267-1.077 2.61-.033.382-.04.772-.036 1.138a1.8 1.8 0 0 0-.487-.065c-.615 0-1.124.335-1.328.873a1.4 1.4 0 0 0 .067 1.161c.136.256.352.486.66.701.082.058.21.14.371.246l.339.221a.4.4 0 0 1 .109.11c.o26.053.o27.11-.o12.217a3.4 3.4 0 0 1-.295.52c-.398.583-.968 1.077-1.696 1.472-.385.204-.786.34-.955.8-.128.348-.044.743.28 1.075q.18.189.409.31a4.4 4.4 0 0 0 1 .4.7.7 0 0 1 .202.09c.118.104.102.26.259.488q.12.178.296.3c.33.229.701.243 1.095.258.355.014.758.03 1.217.18.19.064.389.186.618.328.55.338 1.305.802 2.566.802 1.262 0 2.02-.466 2.576-.806.227-.14.424-.26.609-.321.46-.152.863-.168 1.218-.181.393-.015.764-.03 1.095-.258a1.14 1.14 0 0 0 .336-.368c.114-.192.11-.327.217-.42a.6.6 0 0 1 .19-.087 4.5 4.5 0 0 0 1.014-.404c.16-.087.306-.2.429-.336l.004-.005c.304-.325.38-.709.256-1.047m-1.121.602c-.684.378-1.139.337-1.493.565-.3.193-.122.61-.34.76-.269.186-1.061-.012-2.085.326-.845.279-1.384 1.082-2.903 1.082s-2.045-.801-2.904-1.084c-1.022-.338-1.816-.14-2.084-.325-.218-.15-.041-.568-.341-.761-.354-.228-.809-.187-1.492-.563-.436-.24-.189-.39-.044-.46 2.478-1.199 2.873-3.05 2.89-3.188.022-.166.045-.297-.138-.466-.177-.164-.962-.65-1.18-.802-.36-.252-.52-.503-.402-.812.082-.214.281-.295.49-.295a1 1 0 0 1 .197.022c.396.086.78.285 1.002.338q.04.01.082.011c.118 0 .16-.06.152-.195-.026-.433-.087-1.277-.019-2.066.094-1.084.444-1.622.859-2.097.2-.229 1.137-1.22 2.93-1.22 1.792 0 2.732.987 2.931 1.215.416.475.766 1.013.859 2.098.068.788.009 1.632-.019 2.065-.01.142.034.195.152.195a.4.4 0 0 0 .082-.01c.222-.054.607-.253 1.002-.338a1 1 0 0 1 .197-.023c.21 0 .409.082.49.295.117.309-.04.56-.401.812-.218.152-1.003.638-1.18.802-.184.169-.16.3-.139.466.018.14.413 1.991 2.89 3.189.147.073.394.222-.041.464"/>
    },
    { 
      name: 'WhatsApp', 
      href: 'http://wa.me/2349014425540', 
      tooltip: 'Chat with a beauty expert now!',
      delay: '300ms',
      bgClass: 'bg-green-500 hover:bg-green-600',
      icon: <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.085"/>
    }
  ];

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <div className={`absolute bottom-16 right-0 flex flex-col items-end space-y-3 transition-all duration-500 ${
        socialExpanded 
          ? 'opacity-100 translate-y-0 pointer-events-auto' 
          : 'opacity-0 translate-y-8 pointer-events-none'
      }`}>
        {socialLinks.map((social, index) => (
          <div key={social.name} className={`transform transition-all duration-300 ${socialExpanded ? 'translate-y-0' : 'translate-y-4'}`}
               style={{ transitionDelay: socialExpanded ? social.delay : '0ms' }}>
            <div className="relative group flex items-center">
              <Tooltip text={social.tooltip} bgClass={social.bgClass} />
              <a href={social.href} className={`flex items-center justify-center w-12 h-12 ${social.bgClass} text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110`}>
                <svg className="w-6 h-6" fill={social.name === 'Email' ? 'none' : social.name === 'Snapchat' ? 'black' : 'currentColor'} stroke={social.name === 'Email' ? 'currentColor' : social.name === 'Snapchat' ? 'black' : 'none'} strokeWidth={social.name === 'Snapchat' ? '0.6' : '0'} viewBox="0 0 24 24">
                  {social.icon}
                </svg>
              </a>
            </div>
          </div>
        ))}
      </div>

      <button onClick={toggleSocial} className={`group flex items-center justify-center w-14 h-14 bg-pink-500 hover:bg-pink-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 ${socialExpanded ? 'rotate-45' : 'rotate-0'}`}>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>

      {socialExpanded && (
        <div 
          className="fixed inset-0 -z-10"
          onClick={() => setSocialExpanded(false)}
        />
      )}
    </div>
  );
};

export default SocialMediaWidget;