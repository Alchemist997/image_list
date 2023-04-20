function SVG({name}: {name: string}): React.ReactElement {
  switch (name) {
    case 'loader':
      return (
        <svg
          className="loader_ring"
          xmlns="http://www.w3.org/2000/svg"
          width="80px"
          height="80px"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid"
        >
          <path d="M10 50A40 40 0 0 0 90 50A40 42 0 0 1 10 50" fill="#fff" stroke="none">
            <animateTransform
              attributeName="transform"
              type="rotate"
              dur="0.8s"
              repeatCount="indefinite"
              keyTimes="0;1"
              values="0 50 51;360 50 51"
            />
          </path>
        </svg>
      );

    default:
      console.error('Компонент "SVG" был вызван с некорректным аргументом');
      return <>Empty SVG</>;
  }
}

export default SVG;
