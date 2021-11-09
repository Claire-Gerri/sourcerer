import '../App.css';
import {
    gql,
    useQuery,
}from "@apollo/client";
import { Line } from 'react-chartjs-2';


const DATA = gql`
    query { 
        viewer {
            login
            updatedAt
            repositories(first:2){
                totalCount
                edges{
                    node{
                        updatedAt
                        languages(first:3){
                            edges{
                                node{
                                    name
                                    color
                                }
                            }
                        }
                        defaultBranchRef{
                            target{
                                ... on Commit{
                                    history{
                                        totalCount
                                        edges{
                                            node{
                                                changedFiles
                                                tree{
                                                    entries{
                                                        extension
                                                    }
                                                }
                                                committedDate
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
`;

function Overview() {
    const { loading, error, data } = useQuery(DATA);
    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error :(</p>;
        let languages = data.viewer.repositories.edges.map((edge) => (
            edge.node.languages.edges.flat().map((edge) => (
                edge.node.name
            ))
        )).flat();
        languages = languages.filter((item, index) => languages.indexOf(item) === index);
        let languagesColor = data.viewer.repositories.edges.map((edge) => (
            edge.node.languages.edges.flat().map((edge) => (
                edge.node.color
            ))
        )).flat();
        languagesColor = languagesColor.filter((item, index) => languagesColor.indexOf(item) === index);
        
        let date_par_lang = [];
        data.viewer.repositories.edges.map(edge => edge.node.defaultBranchRef.target.history.edges.map((edge) => 
            edge.node.tree.entries.map((entry) => (
                date_par_lang[entry.extension.substr(1,).replace('js', 'JavaScript').replace('html', 'HTML').replace('css', 'CSS')] = []
            ))
        ));
        data.viewer.repositories.edges.map(edge => edge.node.defaultBranchRef.target.history.edges.map((edge) => 
            edge.node.tree.entries.map((entry) => (
                date_par_lang[entry.extension.substr(1,).replace('js', 'JavaScript').replace('html', 'HTML').replace('css', 'CSS')].push([edge.node.committedDate.substr(0,4)])
            ))
        ));
        let datas = [];
        for (const key in date_par_lang) {
            datas.push({'lang': key, 'dates':{'2018': 0, '2019': 0, '2020': 0, '2021': 0, '2022': 0}})
        }
        let donnees = [];
        for (let i = 0; i < datas.length; i++) {
            donnees[datas[i].lang] = []
            for (const cle in date_par_lang) {
                if (datas[i].lang == cle) {
                    for (const key in datas[i].dates) {
                        for (let j = 0; j < date_par_lang[cle].length; j++) {
                            if (date_par_lang[cle][j] == key) {
                                datas[i].dates[date_par_lang[cle][j]] ++
                            }
                        }
                        donnees[datas[i].lang].push(datas[i].dates[key])
                    }
                }
            }
        }
        let datasets = [];
        for (let i = 0; i < languages.length; i++) {
            datasets.push({ 'label': languages[i], 'fill': true, 'lineTension': 0, 'backgroundColor': languagesColor[i], 'data': donnees[languages[i]]});
        }
    return(
        <div>
            <section className="overview">
                <div className="section_title">
                    <h2>Overview</h2>
                    <p>{data.viewer.repositories.totalCount} repos<br/>
                    Last updated : {data.viewer.updatedAt}</p>
                    <p>2</p>
                </div>
                <div className="section_content">
                    <Line
                        data={{
                            labels: ['2018', '2019', '2020', '2021', '2022'],
                            datasets: datasets
                        }}
                        options={{
                            responsive: true,
                            legend:{
                            display:true,
                            position:'right'
                            },
                            layout:{ padding: '10px'}
                        }}
                    />
                    <div>{languages.map((lang, index) => (
                        <div className="lang_overview">{lang}<div className="lang_couleur" style={{backgroundColor: languagesColor[index]}}></div></div>
                    ))}
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Overview;