import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Brush, ReferenceLine } from 'recharts';

const StockChart = () => {
  const [data, setData] = useState([]);
  const [hiddenLines, setHiddenLines] = useState({
    市净率: true,
    滚动市盈率: true,
    below_net_asset_ratio: true,
    ema_delta_20_highlow: true
  });
  const [displayData, setDisplayData] = useState([]);
  const [brushIndex, setBrushIndex] = useState({
    startIndex: 0,
    endIndex: 0
  });
  const [useCache, setUseCache] = useState(true);
  const [activeData, setActiveData] = useState(null);  // 新增状态管理当前指向数据

  const fetchData = async () => {
    try {
      console.info('useCache', useCache);
      const response = await axios.get(`/api/?symbol=510050&useCache=${useCache}`);
      // 处理日期格式
      const processedData = response.data.map(item => ({
        ...item,
        日期: item.日期.toString()
      }));
      setData(processedData);
      const start = Math.max(0, processedData.length - 100);
      const end = processedData.length - 1;
      setDisplayData(processedData.slice(start, end + 1));
      setBrushIndex({
        startIndex: start,
        endIndex: end
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [useCache]);

  const handleBrushChange = (e) => {
    if (e && e.startIndex !== undefined && e.endIndex !== undefined) {
      const start = Math.max(0, e.startIndex);
      const end = Math.min(data.length - 1, e.endIndex);
      setDisplayData(data.slice(start, end + 1));
      setBrushIndex({  // 更新brush索引
        startIndex: start,
        endIndex: end
      });
    }
  };

  const handleLegendClick = (e) => {
    const dataKey = e.dataKey;
    setHiddenLines(prev => ({
      ...prev,
      [dataKey]: !prev[dataKey]
    }));
  };

  try {
    return (
      <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
          <button onClick={() => setUseCache(!useCache)}>
            {useCache? '缓存' : '非缓存'}
          </button>
        <LineChart
        id='stock-chart'
          width={window.innerWidth * 0.9}  // 动态设置宽度为容器宽度的90%
          height={600}
          data={displayData}  // 使用displayData而不是data
          margin={{
            top: 5, right: 5,  // 右边距为父容器宽度的5%
            left: 5,   // 左边距为父容器宽度的5%
            bottom: 5,
          }}

        onMouseMove={(e) => {
          if (e.activePayload && e.activePayload.length > 0) {
            setActiveData(e.activePayload[0].payload);
          }
        }}
        >
          <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
          <XAxis dataKey="日期" />
          <YAxis yAxisId="left" hide={true}/>
          <YAxis 
            yAxisId="close" 
            domain={calculateYAxisRange(displayData, 'close')}  // 动态计算范围
          />
          <Tooltip />
          <Legend onClick={handleLegendClick} />
          {/* 动态更新ref_close线的y值 */}
          {activeData && (
            <ReferenceLine 
              id='ref_close' 
              yAxisId="close" 
              y={activeData.close} 
              stroke="#8884d8" 
              strokeDasharray="3 3" 
            />
          )}
          <Line 
            yAxisId="close"
            type="monotone" 
            dataKey="close" 
            stroke="#8884d8" 
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 8 }} 
            hide={hiddenLines['close']}
          />
          <YAxis 
            yAxisId="ema_vix_mid" 
            hide={true}
          />
          <Line 
            yAxisId="ema_vix_mid"  // 添加 yAxisId
            type="monotone" 
            dot={false}
            dataKey="ema_vix_mid" 
            stroke="#FF1493" 
            strokeDasharray={'5 2'}
            hide={hiddenLines['ema_vix_mid']}
          />
          <YAxis 
            yAxisId="市净率" 
            hide={true}
          />
          <Line 
            yAxisId="市净率"
            dot={false}
            type="monotone" 
            dataKey="市净率" 
            stroke="#00CED1" 
            strokeDasharray={'5 2'}
            hide={hiddenLines['市净率']}
          />
          <YAxis 
            yAxisId="滚动市盈率" 
            hide={true}
          />
          <Line 
            yAxisId="滚动市盈率"
            dot={false}
            type="monotone" 
            dataKey="滚动市盈率" 
            stroke="#FF8C00" 
            strokeDasharray={'5 2'}
            hide={hiddenLines['滚动市盈率']}
          />
          <YAxis 
            yAxisId="below_net_asset_ratio" 
            hide={true}
          />
          <Line 
            yAxisId="below_net_asset_ratio"
            dot={false}
            type="monotone" 
            dataKey="below_net_asset_ratio" 
            stroke="#8A2BE2" 
            strokeDasharray={'5 2'}
            hide={hiddenLines['below_net_asset_ratio']}
          />
          <YAxis 
            yAxisId="ema_delta_20_highlow" 
            hide={true}
          />
          <Line 
            yAxisId="ema_delta_20_highlow"
            dot={false}
            type="monotone" 
            dataKey="ema_delta_20_highlow" 
            stroke="#20B2AA" 
            strokeDasharray={'5 2'}
            hide={hiddenLines['ema_delta_20_highlow']}
          />
        </LineChart>
        <LineChart
        id='brush-chart'
          width={window.innerWidth * 0.95}  // 宽度与stock-chart保持一致
          height={50}
          data={data}
          margin={{
            top: 5,
            right: window.innerWidth * 0.1,  // 右边距与stock-chart保持一致
            left: window.innerWidth * 0.1,   // 左边距与stock-chart保持一致
            bottom: 5,
          }}
        >
          <Brush
            dataKey="日期"
            height={40}
            stroke="#8884d8"
            startIndex={brushIndex.startIndex}  // 使用状态中的startIndex
            endIndex={brushIndex.endIndex}     // 使用状态中的endIndex
            onDragEnd={handleBrushChange}
            travellerWidth={15}
            gap={10}
            alwaysShowText={true}
            fill="#f5f5f5"
          />
        </LineChart>
      </div>
    );
  } catch (error) {
    console.error('Error rendering chart:', error);
    return <div>图表渲染出错，请稍后再试</div>;
  }
};

export default StockChart;

const calculateYAxisRange = (data, dataKey) => {
  if (!data || data.length === 0) return [0, 100];
  
  const values = data.map(item => item[dataKey]).filter(val => val !== undefined);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  
  return [Math.floor(min - range * 0.1), Math.ceil(max + range * 0.1)];
};