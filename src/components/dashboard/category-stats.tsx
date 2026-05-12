'use client';

import React, { useState, useMemo } from 'react';
import { useAppData } from '@/lib/data/store';
import { formatCurrency } from '@/lib/helpers';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Sector 
} from 'recharts';

interface CategoryStatsProps {
  month: number;
  year: number;
}

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 12}
        outerRadius={outerRadius + 15}
        fill={fill}
      />
    </g>
  );
};

export function CategoryStats({ month, year }: CategoryStatsProps) {
  const { data } = useAppData();
  const [activeIndex, setActiveIndex] = useState(0);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const categoryData = useMemo(() => {
    const monthlyExpenses = data.records.filter(r => {
      const d = new Date(r.date);
      return d.getMonth() === month && d.getFullYear() === year && r.amount < 0;
    });

    const categoryMap = new Map();
    
    // Initialize with all categories
    (data.categories || []).forEach(cat => {
      categoryMap.set(cat.id, { ...cat, value: 0 });
    });
    
    // Uncategorized
    if (!categoryMap.has('uncategorized')) {
        categoryMap.set('uncategorized', { id: 'uncategorized', name: 'Outros', icon: '📦', color: '#D1D5DB', value: 0 });
    }

    monthlyExpenses.forEach(r => {
      const catId = r.categoryId || 'uncategorized';
      const cat = categoryMap.get(catId) || categoryMap.get('uncategorized');
      cat.value += Math.abs(r.amount);
    });

    return Array.from(categoryMap.values())
      .filter(c => c.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [data.records, data.categories, month, year]);

  const totalMonthlyExpense = useMemo(() => 
    categoryData.reduce((acc, c) => acc + c.value, 0), 
  [categoryData]);

  if (categoryData.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-[40px] border border-border/40 p-8 shadow-sm text-center py-16">
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Nenhuma despesa este mês</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-[40px] border border-border/40 p-8 shadow-sm overflow-hidden relative">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Gastos por Categoria</h3>
        <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-apple-blue px-3 py-1 bg-apple-blue/10 rounded-full uppercase tracking-tighter">
                {new Date(year, month).toLocaleDateString('pt-BR', { month: 'long' })}
            </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-4 items-center min-h-[350px]">
        {/* Pie Chart Section */}
        <div className="relative h-[300px] w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                onMouseEnter={onPieEnter}
                paddingAngle={4}
                animationBegin={0}
                animationDuration={600}
                stroke="none"
              >
                {categoryData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color} 
                    className="outline-none focus:outline-none"
                  />
                ))}
              </Pie>
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white dark:bg-zinc-800 border border-border/40 p-3 rounded-2xl shadow-2xl backdrop-blur-md">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{data.name}</p>
                        <p className="text-lg font-black">{formatCurrency(data.value)}</p>
                        <p className="text-[10px] font-bold text-apple-blue">
                          {((data.value / totalMonthlyExpense) * 100).toFixed(1)}% do total
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Central Info Overlay */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                  {categoryData[activeIndex]?.name || 'Total'}
                </p>
                <p className="text-2xl font-black tabular-nums tracking-tighter">
                  {formatCurrency(categoryData[activeIndex]?.value || totalMonthlyExpense)}
                </p>
                <div className="w-8 h-1 bg-secondary mx-auto mt-2 rounded-full overflow-hidden">
                    <motion.div 
                        className="h-full bg-apple-blue" 
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Legend Section */}
        <div className="space-y-3 max-h-[320px] overflow-y-auto no-scrollbar pr-2">
          {categoryData.map((cat, i) => (
            <motion.div
              key={cat.id}
              onMouseEnter={() => setActiveIndex(i)}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer ${
                activeIndex === i ? 'bg-secondary shadow-sm scale-[1.02]' : 'hover:bg-secondary/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm border border-border/10" style={{ backgroundColor: `${cat.color}15` }}>
                  {cat.icon}
                </div>
                <div>
                  <p className="text-xs font-black">{cat.name}</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    {((cat.value / totalMonthlyExpense) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-black tabular-nums">{formatCurrency(cat.value)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Glassmorphism Overlays Simplified */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-apple-blue/5 rounded-full -mr-16 -mt-16 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/5 rounded-full -ml-16 -mb-16 pointer-events-none" />
    </div>
  );
}
