declare module 'react-gauge-chart' {
  import React from 'react';

  interface GaugeChartProps {
    id?: string;
    className?: string;
    style?: React.CSSProperties;
    width?: number;
    height?: number;
    marginInPercent?: number;
    cornerRadius?: number;
    nrOfLevels?: number;
    percent?: number;
    arcWidth?: number;
    arcPadding?: number;
    textColor?: string;
    needleColor?: string;
    needleBaseColor?: string;
    hideText?: boolean;
    arcsLength?: number[];
    colors?: string[];
    formatTextValue?: (value: number) => string;
    animate?: boolean;
    animDelay?: number;
    animateDuration?: number;
  }

  const GaugeChart: React.FC<GaugeChartProps>;

  export default GaugeChart;
}
