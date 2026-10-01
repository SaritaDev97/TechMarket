import { Link, useParams } from 'react-router-dom'
import Breadcrumb from '../components/ui/Breadcrumb'
import { IDEAS } from '../data/products'

const GUIAS = {
  'laptop-estudiar': {
    title: 'Cómo elegir una laptop para estudiar',
    intro:
      'Elegir una laptop para estudiar depende del tipo de tareas que realizarás. No necesitas necesariamente el equipo más costoso, sino uno equilibrado que pueda acompañarte durante varios años.',
    sections: [
      {
        title: '1. Elige un procesador adecuado',
        text:
          'Para tareas como navegar por Internet, utilizar Office, realizar videollamadas y estudiar, un procesador de gama media suele ser suficiente. Si utilizarás programación, máquinas virtuales, edición o aplicaciones más exigentes, conviene buscar un procesador con mayor rendimiento y varios núcleos.'
      },
      {
        title: '2. Memoria RAM',
        text:
          'Actualmente, 8 GB de RAM pueden funcionar para tareas básicas, pero 16 GB ofrecen una experiencia más cómoda para estudiar, programar y utilizar varias aplicaciones al mismo tiempo. Para trabajos más exigentes, 32 GB pueden ser útiles.'
      },
      {
        title: '3. Almacenamiento SSD',
        text:
          'Es recomendable elegir una laptop con unidad SSD. Un SSD permite iniciar el sistema y abrir programas mucho más rápido que un disco duro tradicional. 512 GB suele ser una capacidad equilibrada para estudiantes.'
      },
      {
        title: '4. Pantalla',
        text:
          'Una pantalla Full HD de aproximadamente 14 o 15.6 pulgadas ofrece un buen equilibrio entre comodidad y portabilidad. Si vas a transportar la computadora diariamente, también debes considerar su peso.'
      },
      {
        title: '5. Batería y conectividad',
        text:
          'Una buena autonomía es importante para utilizar la laptop durante clases o jornadas de estudio. También conviene revisar que tenga los puertos que necesitas, como USB, USB-C, HDMI y conexión para audífonos.'
      },
      {
        title: '6. Para estudiantes de programación',
        text:
          'Si utilizarás IDE, bases de datos, Android Studio, emuladores o máquinas virtuales, es recomendable priorizar 16 GB de RAM, almacenamiento SSD y un procesador moderno de gama media o superior.'
      }
    ],
    conclusion:
      'La mejor laptop para estudiar es la que ofrece un equilibrio entre rendimiento, autonomía, almacenamiento y presupuesto. Antes de comprar, piensa primero en los programas que realmente utilizarás.'
  },

  'bateria-celular': {
    title: 'Cómo cuidar la batería de tu celular',
    intro:
      'La batería es uno de los componentes que se degrada con el uso y el paso del tiempo. Algunos hábitos pueden ayudar a reducir su desgaste y conservar un buen rendimiento durante más tiempo.',
    sections: [
      {
        title: '1. Evita las temperaturas extremas',
        text:
          'El calor excesivo puede acelerar el desgaste de una batería. Evita dejar el teléfono bajo el sol, dentro de un vehículo caliente o cerca de fuentes intensas de calor.'
      },
      {
        title: '2. Utiliza cargadores adecuados',
        text:
          'Utiliza cargadores compatibles y de buena calidad. Un cargador adecuado debe cumplir con las especificaciones requeridas por el dispositivo.'
      },
      {
        title: '3. Activa la carga optimizada',
        text:
          'Muchos teléfonos modernos incluyen funciones de carga adaptativa u optimizada. Estas funciones intentan reducir el tiempo que la batería permanece completamente cargada cuando no es necesario.'
      },
      {
        title: '4. No necesitas esperar siempre al 0 %',
        text:
          'Las baterías modernas de ion de litio no necesitan descargarse completamente antes de volver a cargarlas. Puedes realizar cargas parciales durante el día.'
      },
      {
        title: '5. Revisa las aplicaciones',
        text:
          'Desde los ajustes del teléfono puedes identificar qué aplicaciones consumen más energía. Limitar procesos innecesarios en segundo plano puede mejorar la autonomía diaria.'
      },
      {
        title: '6. Reduce consumos innecesarios',
        text:
          'Disminuir el brillo cuando no necesitas el máximo nivel, utilizar modos de ahorro y desactivar funciones que no estés usando puede reducir el consumo de energía.'
      }
    ],
    conclusion:
      'Ninguna batería dura para siempre, pero controlar la temperatura, utilizar accesorios adecuados y aprovechar las funciones de administración de energía puede ayudar a conservarla en mejores condiciones.'
  },

  'audifonos-adecuados': {
    title: 'Cómo elegir los audífonos adecuados',
    intro:
      'No todos los audífonos están diseñados para el mismo uso. Antes de comprar debes considerar comodidad, sonido, conectividad, micrófono y autonomía.',
    sections: [
      {
        title: '1. Define para qué los utilizarás',
        text:
          'Para estudiar o trabajar puede ser importante la comodidad y el micrófono. Para videojuegos puede interesarte una baja latencia y sonido direccional. Para viajar, la cancelación de ruido puede resultar especialmente útil.'
      },
      {
        title: '2. Comodidad',
        text:
          'Si utilizarás los audífonos durante varias horas, revisa el peso, el material de las almohadillas y el ajuste. Un buen sonido no compensa unos audífonos incómodos.'
      },
      {
        title: '3. Con cable o inalámbricos',
        text:
          'Los modelos con cable no necesitan batería y normalmente ofrecen una conexión sencilla. Los inalámbricos proporcionan mayor libertad de movimiento, pero requieren recarga.'
      },
      {
        title: '4. Calidad de sonido',
        text:
          'La calidad no depende únicamente del volumen. Busca un sonido equilibrado y adecuado al contenido que escuchas. Las preferencias pueden variar según música, películas, llamadas o videojuegos.'
      },
      {
        title: '5. Micrófono',
        text:
          'Si realizas videollamadas, clases virtuales o juegas en línea, la claridad del micrófono puede ser tan importante como la calidad de los altavoces.'
      },
      {
        title: '6. Batería y cancelación de ruido',
        text:
          'En modelos Bluetooth, compara la autonomía indicada y las opciones de carga. La cancelación activa de ruido puede ser útil en lugares concurridos, aunque normalmente consume energía adicional.'
      }
    ],
    conclusion:
      'El mejor audífono depende de cómo piensas utilizarlo. Compara comodidad, conectividad, micrófono, autonomía y sonido antes de decidir.'
  },

  'teclado-mecanico-vs-convencional': {
    title: 'Teclado mecánico vs. teclado convencional',
    intro:
      'Los teclados mecánicos y los convencionales pueden cumplir las mismas funciones básicas, pero ofrecen sensaciones, características y precios diferentes.',
    sections: [
      {
        title: '1. ¿Qué es un teclado mecánico?',
        text:
          'Un teclado mecánico utiliza interruptores individuales debajo de las teclas. Dependiendo del tipo de switch, la pulsación puede sentirse lineal, táctil o producir un clic audible.'
      },
      {
        title: '2. Teclados convencionales',
        text:
          'Muchos teclados convencionales utilizan membranas. Generalmente son económicos, silenciosos y suficientes para tareas cotidianas.'
      },
      {
        title: '3. Escritura y programación',
        text:
          'Para escribir o programar durante muchas horas, la preferencia es personal. Algunas personas prefieren la respuesta de un teclado mecánico, mientras otras valoran el menor ruido de uno de membrana.'
      },
      {
        title: '4. Gaming',
        text:
          'Los teclados orientados a videojuegos pueden incorporar funciones como anti-ghosting, iluminación, macros o diferentes tipos de switches.'
      },
      {
        title: '5. Ruido',
        text:
          'Algunos switches mecánicos pueden ser considerablemente más ruidosos. Esto debe tenerse en cuenta si compartes espacio con otras personas.'
      },
      {
        title: '6. ¿Cuál elegir?',
        text:
          'Para uso cotidiano, un buen teclado convencional puede ser suficiente. Si buscas una sensación de escritura específica, personalización o determinadas características para gaming, un modelo mecánico puede resultar atractivo.'
      }
    ],
    conclusion:
      'No existe una opción universalmente superior. La elección depende del presupuesto, el nivel de ruido aceptable, el uso y la sensación de escritura que prefieras.'
  },

  'mouse-gaming': {
    title: 'Cómo elegir un mouse para gaming',
    intro:
      'Un mouse gaming debe adaptarse tanto a tu mano como al tipo de juegos que utilizas. Una cifra alta de DPI por sí sola no garantiza una mejor experiencia.',
    sections: [
      {
        title: '1. Ergonomía',
        text:
          'El tamaño y la forma deben adaptarse a tu mano y a tu manera de sujetar el mouse. La comodidad es especialmente importante durante sesiones prolongadas.'
      },
      {
        title: '2. Sensor',
        text:
          'Un buen sensor debe proporcionar un seguimiento preciso y consistente. Para jugar, la precisión suele ser más importante que simplemente buscar el valor máximo de DPI.'
      },
      {
        title: '3. DPI y sensibilidad',
        text:
          'Los DPI determinan cuánto se desplaza el cursor respecto al movimiento físico del mouse. Poder ajustar la sensibilidad permite adaptarlo a diferentes juegos y preferencias.'
      },
      {
        title: '4. Peso',
        text:
          'Algunos jugadores prefieren modelos ligeros para movimientos rápidos, mientras otros prefieren mayor peso y sensación de control. Es una característica muy personal.'
      },
      {
        title: '5. Botones adicionales',
        text:
          'Los botones programables pueden resultar útiles para asignar acciones, especialmente en determinados juegos o incluso en aplicaciones de productividad.'
      },
      {
        title: '6. Cableado o inalámbrico',
        text:
          'Los modelos inalámbricos modernos pueden ofrecer una experiencia muy cómoda. Antes de elegir uno, revisa autonomía, sistema de carga y tipo de conexión.'
      }
    ],
    conclusion:
      'Prioriza ergonomía, precisión del sensor y comodidad. El mouse con más especificaciones no necesariamente será el que mejor se adapte a ti.'
  },

  'accesorios-computadora': {
    title: 'Accesorios esenciales para tu computadora',
    intro:
      'Los accesorios adecuados pueden mejorar la comodidad, productividad y organización de un espacio de estudio, trabajo o entretenimiento.',
    sections: [
      {
        title: '1. Mouse',
        text:
          'Un mouse externo puede proporcionar mayor comodidad y precisión que el touchpad de una laptop, especialmente durante sesiones largas.'
      },
      {
        title: '2. Teclado externo',
        text:
          'Un teclado independiente puede mejorar la ergonomía cuando utilizas una laptop conectada a un monitor o colocada sobre un soporte.'
      },
      {
        title: '3. Audífonos o headset',
        text:
          'Son útiles para clases virtuales, reuniones, videojuegos y contenido multimedia. Si realizarás llamadas, presta atención también a la calidad del micrófono.'
      },
      {
        title: '4. Monitor',
        text:
          'Una segunda pantalla puede proporcionar más espacio de trabajo para programación, documentos, investigación o edición.'
      },
      {
        title: '5. Almacenamiento externo',
        text:
          'Una unidad externa puede servir para respaldar archivos importantes o transportar información. Mantener copias de seguridad ayuda a reducir el riesgo de pérdida de datos.'
      },
      {
        title: '6. Protección eléctrica',
        text:
          'Dependiendo de tus necesidades, una regleta con protección contra sobretensiones o un UPS puede ayudar a proteger el equipo y proporcionar tiempo para guardar el trabajo ante una interrupción eléctrica.'
      }
    ],
    conclusion:
      'No necesitas comprar todos los accesorios. Empieza por identificar qué problemas quieres resolver y elige aquellos que realmente mejoren tu forma de utilizar la computadora.'
  }
}

const SLUGS = {
  'Cómo elegir una laptop para estudiar': 'laptop-estudiar',
  'Cómo cuidar la batería de tu celular': 'bateria-celular',
  'Cómo elegir los audífonos adecuados': 'audifonos-adecuados',
  'Teclado mecánico vs. teclado convencional': 'teclado-mecanico-vs-convencional',
  'Cómo elegir un mouse para gaming': 'mouse-gaming',
  'Accesorios esenciales para tu computadora': 'accesorios-computadora'
}

function GuiaDetallePage() {
  const { slug } = useParams()
  const guia = GUIAS[slug]

  const idea = IDEAS.find(item => SLUGS[item.title] === slug)

  if (!guia) {
    return (
      <main>
        <div className="container" style={{ padding: '5rem 1rem', textAlign: 'center' }}>
          <h1>Guía no encontrada</h1>
          <Link to="/ideas">Volver a Guías y soluciones</Link>
        </div>
      </main>
    )
  }

  return (
    <main>
      <Breadcrumb current={guia.title} />

      <section
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          padding: '3.5rem 1rem'
        }}
      >
        <div
          className="container"
          style={{
            maxWidth: '900px',
            margin: '0 auto'
          }}
        >
          <span
            style={{
              display: 'inline-block',
              background: 'rgba(255,255,255,0.12)',
              color: '#fff',
              padding: '0.35rem 0.8rem',
              borderRadius: '20px',
              fontSize: '0.8rem',
              marginBottom: '1rem'
            }}
          >
            {idea?.tag || 'Guía TechMarket'}
          </span>

          <h1
            style={{
              color: '#fff',
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              lineHeight: 1.1,
              marginBottom: '1rem'
            }}
          >
            {guia.title}
          </h1>

          <p
            style={{
              color: 'rgba(255,255,255,0.7)',
              fontSize: '1.05rem'
            }}
          >
            Guía práctica TechMarket · {idea?.tiempo || '5 min'} de lectura
          </p>
        </div>
      </section>

      <section className="section section--gray">
        <div
          className="container"
          style={{
            maxWidth: '900px',
            margin: '0 auto'
          }}
        >
          <article
            style={{
              background: '#fff',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 2px 12px rgba(0,0,0,0.07)'
            }}
          >
            {idea?.img && (
              <img
                src={idea.img}
                alt={guia.title}
                style={{
                  width: '100%',
                  height: '360px',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
            )}

            <div
              style={{
                padding: 'clamp(1.5rem, 5vw, 3rem)'
              }}
            >
              <p
                style={{
                  fontSize: '1.05rem',
                  lineHeight: 1.8,
                  color: '#4b5563',
                  marginBottom: '2.5rem'
                }}
              >
                {guia.intro}
              </p>

              {guia.sections.map((section, index) => (
                <section
                  key={index}
                  style={{
                    marginBottom: '2rem'
                  }}
                >
                  <h2
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.4rem',
                      color: '#111827',
                      marginBottom: '0.65rem'
                    }}
                  >
                    {section.title}
                  </h2>

                  <p
                    style={{
                      color: '#4b5563',
                      lineHeight: 1.8,
                      fontSize: '0.98rem'
                    }}
                  >
                    {section.text}
                  </p>
                </section>
              ))}

              <div
                style={{
                  marginTop: '2.5rem',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  background: '#f8fafc',
                  borderLeft: '4px solid var(--accent)'
                }}
              >
                <h3
                  style={{
                    marginBottom: '0.5rem',
                    fontFamily: 'var(--font-display)'
                  }}
                >
                  Recomendación final
                </h3>

                <p
                  style={{
                    color: '#4b5563',
                    lineHeight: 1.7
                  }}
                >
                  {guia.conclusion}
                </p>
              </div>

              <Link
                to="/ideas"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  marginTop: '2rem',
                  padding: '0.75rem 1.25rem',
                  background: 'var(--accent)',
                  color: '#fff',
                  borderRadius: '8px',
                  fontWeight: 700,
                  textDecoration: 'none'
                }}
              >
                ← Volver a Guías y soluciones
              </Link>
            </div>
          </article>
        </div>
      </section>
    </main>
  )
}

export { SLUGS }
export default GuiaDetallePage