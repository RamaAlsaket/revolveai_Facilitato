import React, { useEffect, useRef } from 'react';
import { hierarchy, tree, select, zoom, linkHorizontal, scaleOrdinal, schemeTableau10, zoomIdentity } from 'd3';
import type { HierarchyNode, HierarchyLink } from 'd3';
import type { MindMapNode } from '../types';
import Loader from './Loader';

interface MindMapProps {
  data: MindMapNode | null;
  fetchData: () => void;
  isLoading: boolean;
  loadingMessage: string;
  businessIdea: string;
}

const MindMap: React.FC<MindMapProps> = ({ data, fetchData, isLoading, loadingMessage, businessIdea }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (businessIdea && !data) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessIdea]);
  
  useEffect(() => {
    if (!data || !svgRef.current || !containerRef.current) return;

    const root = hierarchy(data);
    (root as any).x0 = 0;
    (root as any).y0 = 0;

    root.descendants().forEach((d: any, i) => {
        d.id = i;
        d._children = d.children;
        if (d.depth > 1) d.children = null;
    });

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    
    const svg = select(svgRef.current)
      .attr('viewBox', [0, 0, width, height])
      .style('width', '100%')
      .style('height', '100%');
      
    svg.selectAll('*').remove();

    const g = svg.append('g');
    
    const treeLayout = tree<MindMapNode>().nodeSize([45, 260]);
    
    const nodeIcons: { [key: string]: string } = {
        'Value Proposition': '💡',
        'Market Analysis': '📈',
        'Product & Service': '📦',
        'Go-to-Market Strategy': '🚀',
        'Operations': '⚙️',
        'Financials': '💰'
    };

    const color = scaleOrdinal(schemeTableau10);
    
    // @ts-ignore
    const zoomBehavior = zoom<SVGSVGElement, unknown>().scaleExtent([0.2, 3]).on('zoom', (event) => {
      g.attr('transform', event.transform);
    });
    // @ts-ignore
    svg.call(zoomBehavior);

    // Center view on root node initially
    const initialTransform = zoomIdentity.translate(width / 4, height / 2);
    // @ts-ignore
    svg.call(zoomBehavior.transform, initialTransform);


    function update(source: HierarchyNode<MindMapNode>) {
      const duration = 250;
      const nodes = root.descendants().reverse();
      const links = root.links();

      treeLayout(root);

      let left = root;
      let right = root;
      root.eachBefore(node => {
        if (node.x < left.x) left = node;
        if (node.x > right.x) right = node;
      });

      const transition = svg.transition().duration(duration);
      
      const linkGenerator = linkHorizontal<any, HierarchyNode<MindMapNode>>()
        .x(d => d.y)
        .y(d => d.x);
        
      const link = g.selectAll('path.link')
        .data(links, (d: HierarchyLink<MindMapNode>) => d.target.id);
        
      const linkEnter = link.enter().append('path')
        .attr('class', 'link')
        .attr('d', () => {
          const o = {x: (source as any).x0, y: (source as any).y0};
          return linkGenerator({source: o, target: o} as any);
        })
        .attr('fill', 'none')
        .attr('stroke', '#00CFFF')
        .attr('stroke-opacity', 0.5)
        .attr('stroke-width', 2);
        
      link.merge(linkEnter).transition(transition)
          .attr('d', linkGenerator);
          
      link.exit().transition(transition).remove()
        .attr('d', () => {
          const o = {x: source.x, y: source.y};
          return linkGenerator({source: o, target: o} as any);
        });

      const node = g.selectAll('g.node')
        .data(nodes, d => d.id);
        
      const nodeEnter = node.enter().append('g')
        .attr('class', 'node')
        .attr('transform', () => `translate(${(source as any).y0},${(source as any).x0})`)
        .attr('fill-opacity', 0)
        .attr('stroke-opacity', 0)
        .on('click', (event, d) => {
          d.children = d.children ? null : (d as any)._children;
          update(d);
        });
        
      nodeEnter.append('circle')
        .attr('r', d => d.depth === 0 ? 12 : 8)
        .style('cursor', 'pointer')
        .attr('fill', d => {
          if (d.depth === 0) return '#1AD1FF';
          const topLevelParent = d.ancestors().find(a => a.depth === 1);
          return (d as any)._children ? color(topLevelParent ? topLevelParent.data.name : d.data.name) : '#fff';
        })
        .attr('stroke', d => d.depth === 0 ? '#0B3D91' : '#00CFFF')
        .attr('stroke-width', d => d.depth === 0 ? 4 : 2.5);
        
      nodeEnter.append('text')
        .attr('dy', '0.31em')
        .attr('x', d => d.depth === 0 ? -20 : 20)
        .attr('text-anchor', d => d.depth === 0 ? 'end' : 'start')
        .text(d => `${nodeIcons[d.data.name] || ''} ${d.data.name}`)
        .attr('fill', 'white')
        .style('font-size', d => d.depth === 0 ? '18px' : '15px')
        .style('font-weight', d => d.depth === 0 ? 'bold' : 'normal')
        .clone(true).lower()
        .attr('stroke-linejoin', 'round')
        .attr('stroke-width', 3)
        .attr('stroke', 'rgba(11, 61, 145, 0.9)');
        
      node.merge(nodeEnter).transition(transition)
        .attr('transform', d => `translate(${d.y},${d.x})`)
        .attr('fill-opacity', 1)
        .attr('stroke-opacity', 1);
        
      node.exit().transition(transition).remove()
        .attr('transform', `translate(${source.y},${source.x})`)
        .attr('fill-opacity', 0)
        .attr('stroke-opacity', 0);
        
      root.eachBefore(d => {
        (d as any).x0 = d.x;
        (d as any).y0 = d.y;
      });
    }
    
    update(root);

  }, [data]);

  return (
    <div className="w-full flex-grow flex flex-col bg-black/20 rounded-xl shadow-lg p-4 animate-fade-in">
        {isLoading && !data ? (
            <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                    <Loader />
                    <p className="mt-2 text-cyan-200">{loadingMessage || 'Generating Mind Map...'}</p>
                </div>
            </div>
        ) : data ? (
            <div ref={containerRef} className="w-full h-full min-h-[500px] cursor-grab">
                <svg ref={svgRef}></svg>
            </div>
        ) : (
            <div className="text-center text-cyan-200 py-10">
                <p>Mind Map will be generated here.</p>
            </div>
        )}
    </div>
  );
};

export default MindMap;