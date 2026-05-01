import React from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout/legacy';
import MetricCard from './MetricCard';
import { BarChartPanel, LineChartPanel, AreaChartPanel, PieChartPanel } from './Charts';
import { Trash2, Edit2 } from 'lucide-react';

const ResponsiveGridLayout = WidthProvider(Responsive);

const ReportCanvas = ({ 
  items, 
  layout, 
  onLayoutChange, 
  isEditMode, 
  onEditItem, 
  onDeleteItem 
}) => {
  const renderItem = (item) => {
    const { type, config } = item;

    if (type === 'metric') {
      return (
        <MetricCard 
          {...config} 
          isEditMode={isEditMode}
          onEdit={() => onEditItem(item)}
          onDelete={() => onDeleteItem(item.id)}
        />
      );
    }

    if (type === 'chart') {
      const ChartComponent = {
        bar: BarChartPanel,
        line: LineChartPanel,
        area: AreaChartPanel,
        pie: PieChartPanel
      }[config.type];

      return (
        <div className={`canvas-card chart-container ${isEditMode ? 'editing' : ''}`}>
          {isEditMode && (
            <div className="card-controls">
              <button className="btn btn-icon btn-ghost btn-sm" onClick={() => onEditItem(item)}>
                <Edit2 size={14} />
              </button>
              <button className="btn btn-icon btn-ghost btn-sm text-danger" onClick={() => onDeleteItem(item.id)}>
                <Trash2 size={14} />
              </button>
            </div>
          )}
          {ChartComponent ? <ChartComponent config={config} isCanvas /> : <div>Unknown Chart Type</div>}
        </div>
      );
    }

    if (type === 'text') {
      return (
        <div className="canvas-card text-card">
           {isEditMode && (
            <div className="card-controls">
              <button className="btn btn-icon btn-ghost btn-sm" onClick={() => onEditItem(item)}>
                <Edit2 size={14} />
              </button>
              <button className="btn btn-icon btn-ghost btn-sm text-danger" onClick={() => onDeleteItem(item.id)}>
                <Trash2 size={14} />
              </button>
            </div>
          )}
          <div className="card-body">
            <h3 className="mb-2">{config.title}</h3>
            <p className="text-muted">{config.content}</p>
          </div>
        </div>
      );
    }

    return <div>Unknown Item Type</div>;
  };

  return (
    <div className="canvas-container">
      <ResponsiveGridLayout
        className="layout"
        layouts={{ lg: layout }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={100}
        draggableHandle=".card-header, .card-title"
        isDraggable={isEditMode}
        isResizable={isEditMode}
        onLayoutChange={(newLayout) => onLayoutChange(newLayout)}
        margin={[20, 20]}
      >
        {items.map((item) => (
          <div key={item.id} className="canvas-item">
            {renderItem(item)}
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
};

export default ReportCanvas;
