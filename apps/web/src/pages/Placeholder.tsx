import './Placeholder.css';

interface PlaceholderProps {
  title: string;
}

/* Tela temporária para módulos ainda não implementados. Mantém a navegação
   coerente enquanto cada módulo de domínio recebe sua própria página. */
export default function Placeholder({ title }: PlaceholderProps) {
  return (
    <div className="placeholder">
      <div className="placeholder__card">
        <span className="placeholder__badge">Em construção</span>
        <h2>Módulo {title}</h2>
        <p>
          Esta área ainda não foi implementada. O layout, o tema e a navegação já estão prontos —
          basta criar a página do módulo seguindo o padrão do Dashboard.
        </p>
      </div>
    </div>
  );
}
